package expo.modules.print

import android.content.Context
import android.os.ParcelFileDescriptor
import android.print.PrintAttributes
import android.print.PrintManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.print.PrintDocumentAdapter
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.functions.Coroutine
import kotlinx.coroutines.CancellableContinuation
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import java.io.File
import java.io.IOException
import java.lang.ref.WeakReference
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.coroutines.Continuation
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

private const val ORIENTATION_PORTRAIT = "portrait"
private const val ORIENTATION_LANDSCAPE = "landscape"

class PrintModule : Module() {
  private val jobName = "Printing"
  override fun definition() = ModuleDefinition {
    Name("ExpoPrint")

    Constant("Orientation") {
      mapOf(
        "portrait" to ORIENTATION_PORTRAIT,
        "landscape" to ORIENTATION_LANDSCAPE
      )
    }

    AsyncFunction("print") Coroutine { options: PrintOptions ->
      return@Coroutine print(options)
    }

    AsyncFunction("printToFileAsync") Coroutine { options: PrintOptions ->
      return@Coroutine printToFile(options)
    }
  }

  val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private suspend fun print(options: PrintOptions) {
    withContext(Dispatchers.Main) {
      suspendCancellableCoroutine { continuation ->
        if (options.html != null) {
          // Renders HTML to PDF and then prints
          try {
            val renderTask = PrintPDFRenderTask(context, options)
            renderTask.render(
              null,
              null,
              createPrintCallbacks(options, continuation)
            )
          } catch (e: Exception) {
            continuation.resumeWithException(UnexpectedPrintException("There was an error while trying to print HTML ", e))
          }
        } else {
          // Prints from given URI (file path or base64 data URI starting with `data:*;base64,`)
          try {
            val pda = PrintDocumentAdapter(WeakReference(context), continuation, options.uri)
            printDocumentToPrinter(pda, options)
            continuation.resume(null)
          } catch (e: Exception) {
            continuation.resumeWithException(UnexpectedPrintException("There was an error while trying to print file ", e))
          }
        }
      }
    }
  }

  private suspend fun printToFile(options: PrintOptions): FilePrintResult? {
    var outputFile: File? = null
    var fileDescriptor: ParcelFileDescriptor? = null
    var taskOwnsDescriptor = false
    var delivered = false
    try {
      // Keep ownership outside the dispatcher boundary: cancellation during
      // creation/opening must not orphan a partial file or open descriptor.
      withContext(Dispatchers.IO) {
        try {
          val file = File(FileUtils.generateFilePath(context))
          outputFile = file
          file.createNewFile()
          fileDescriptor = ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_TRUNCATE or ParcelFileDescriptor.MODE_WRITE_ONLY)
        } catch (exception: IOException) {
          throw UnexpectedPrintException("The report file could not be prepared. Please try again.", exception)
        }
      }
      val result = withContext(Dispatchers.Main) {
        suspendCancellableCoroutine<FilePrintResult> { continuation ->
          val renderTask = PrintPDFRenderTask(context, options)
          continuation.invokeOnCancellation { renderTask.cancel() }
          // render() takes ownership even if cancellation happened immediately
          // while the handler was being registered. Its pre-render flag closes
          // the transferred descriptor without creating a WebView.
          taskOwnsDescriptor = true
          renderTask.render(outputFile, fileDescriptor, createPrintToFileCallbacks(options, continuation))
        }
      }
      delivered = true
      return result
    } finally {
      if (!taskOwnsDescriptor) runCatching { fileDescriptor?.close() }
      // A result cancelled between resume and dispatcher delivery is not a
      // shared report. Remove only the private temporary output from this call.
      if (!delivered) runCatching { outputFile?.delete() }
    }
  }

  private fun createPrintToFileCallbacks(options: PrintOptions, continuation: CancellableContinuation<FilePrintResult>): PrintPDFRenderTask.Callbacks {
    val settled = AtomicBoolean(false)
    return object : PrintPDFRenderTask.Callbacks() {
      override fun onRenderFinished(document: PrintDocumentAdapter, outputFile: File?, numberOfPages: Int) {
        if (!settled.compareAndSet(false, true)) return
        val result = try {
          val uri = FileUtils.uriFromFile(outputFile).toString()
          val base64 = if (options.base64) outputFile?.let { FileUtils.encodeFromFile(it) } else null
          FilePrintResult(uri, numberOfPages, base64)
        } catch (exception: Exception) {
          runCatching { outputFile?.delete() }
          if (continuation.isActive) continuation.resumeWithException(UnexpectedPrintException("The report could not be prepared. Please try again.", exception))
          return
        }
        if (!continuation.isActive) {
          runCatching { outputFile?.delete() }
          return
        }
        // The atomic continuation also owns the file if cancellation wins
        // after this resume but before its dispatcher delivers the result.
        continuation.resume(result, onCancellation = { _, _, _ -> runCatching { outputFile?.delete() } })
      }

      override fun onRenderError(exception: CodedException) {
        if (!settled.compareAndSet(false, true)) return
        if (continuation.isActive) continuation.resumeWithException(exception)
      }
    }
  }

  private fun createPrintCallbacks(options: PrintOptions, continuation: Continuation<Unit>): PrintPDFRenderTask.Callbacks {
    return object : PrintPDFRenderTask.Callbacks() {
      override fun onRenderFinished(document: PrintDocumentAdapter, outputFile: File?, numberOfPages: Int) {
        printDocumentToPrinter(document, options)
        continuation.resume(Unit)
      }

      override fun onRenderError(exception: CodedException) {
        continuation.resumeWithException(exception)
      }
    }
  }

  private fun printDocumentToPrinter(document: PrintDocumentAdapter, options: PrintOptions) {
    (appContext.throwingActivity.getSystemService(Context.PRINT_SERVICE) as? PrintManager)?.let {
      val attributes = getAttributesFromOptions(options)
      it.print(jobName, document, attributes.build())
    } ?: throw PrintManagerNotAvailableException()
  }

  private fun getAttributesFromOptions(options: PrintOptions): PrintAttributes.Builder {
    val orientation = options.orientation
    val builder = PrintAttributes.Builder()

    // @tsapeta: Unfortunately these attributes might be ignored on some devices or Android versions,
    // in other words it might not change the default orientation in the print dialog,
    // however the user can change it there.
    if (ORIENTATION_LANDSCAPE == orientation) {
      builder.setMediaSize(PrintAttributes.MediaSize.UNKNOWN_LANDSCAPE)
    } else {
      builder.setMediaSize(PrintAttributes.MediaSize.UNKNOWN_PORTRAIT)
    }

    // @tsapeta: It should just copy the document without adding extra margins,
    // document's margins can be controlled by @page block in CSS.
    builder.setMinMargins(PrintAttributes.Margins.NO_MARGINS)
    return builder
  }
}
