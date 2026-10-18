package expo.modules.print

import android.annotation.SuppressLint
import android.content.Context
import android.os.CancellationSignal
import android.os.Handler
import android.os.Looper
import android.os.ParcelFileDescriptor
import android.print.PageRange
import android.print.PrintAttributes
import android.print.PrintDocumentAdapter
import android.print.PrintDocumentAdapterLayoutCallback
import android.print.PrintDocumentAdapterWriteCallback
import android.print.PrintDocumentInfo
import android.view.ViewGroup
import android.webkit.RenderProcessGoneDetail
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.annotation.UiThread
import expo.modules.kotlin.exception.CodedException
import java.io.File
import kotlin.math.roundToInt

// Campaign's pinned file-render lifecycle correction. Generic PrintManager
// handoff deliberately retains its adapter/WebView until the system is done.
internal class PrintPDFRenderTask(private val context: Context, private val options: PrintOptions) {
  private val PIXELS_PER_INCH = 72
  private val MILS_PER_INCH = 1000.0
  private val PIXELS_PER_MIL = PIXELS_PER_INCH / MILS_PER_INCH
  private val DEFAULT_MEDIA_WIDTH = 612
  private val DEFAULT_MEDIA_HEIGHT = 792
  private val mainHandler = Handler(Looper.getMainLooper())
  private val cancellationSignal = CancellationSignal()
  private var outputFile: File? = null
  private var callbacks: Callbacks? = null
  private var webView: WebView? = null
  private var fileDescriptor: ParcelFileDescriptor? = null
  private var document: PrintDocumentAdapter? = null
  private var numberOfPages = 0
  private var renderStarted = false
  private var fileRender = false
  private var pageStarted = false
  private var layoutFinished = false
  private var terminal = false
  private var cancellationRequested = false
  private val watchdog = Runnable {
    finishFile(UnexpectedPrintException("The report took too long to prepare. Please try again."))
  }

  @UiThread
  fun render(outputFile: File?, fileDescriptor: ParcelFileDescriptor?, callbacks: Callbacks) {
    check(!renderStarted) { "A print render task can only be used once" }
    renderStarted = true
    this.callbacks = callbacks
    this.fileDescriptor = fileDescriptor
    this.outputFile = outputFile
    fileRender = outputFile != null || fileDescriptor != null
    if (fileRender && cancellationRequested) {
      finishFile(UnexpectedPrintException("Report preparation was cancelled. Please try again."))
      return
    }

    try {
      if (fileRender) mainHandler.postDelayed(watchdog, 45_000L)
      val view = WebView(context)
      webView = view
      view.settings.defaultTextEncodingName = "UTF-8"
      view.webViewClient = webViewClient
      options.textZoom?.let { view.settings.textZoom = it }
      view.loadDataWithBaseURL(null, options.html ?: "", "text/html; charset=utf-8", "UTF-8", null)
    } catch (exception: Exception) {
      if (!fileRender) throw exception
      finishFile(UnexpectedPrintException("The report could not be prepared. Please try again.", exception))
    }
  }

  // Cancellation can arrive from a coroutine worker; WebView/adapter cleanup
  // always runs on the main thread, including cancellation before render().
  fun cancel() {
    onMain {
      cancellationRequested = true
      if (fileRender) finishFile(UnexpectedPrintException("Report preparation was cancelled. Please try again."))
    }
  }

  private fun onMain(action: () -> Unit) {
    if (Looper.myLooper() == Looper.getMainLooper()) action() else mainHandler.post { action() }
  }

  private val printAttributes: PrintAttributes
    get() {
      val builder = PrintAttributes.Builder()
      if (options.html != null) {
        val width = options.width ?: DEFAULT_MEDIA_WIDTH
        val height = options.height ?: DEFAULT_MEDIA_HEIGHT
        var mediaSize = PrintAttributes.MediaSize("id", "label", (width / PIXELS_PER_MIL).roundToInt(), (height / PIXELS_PER_MIL).roundToInt())
        options.orientation?.let { if (it === "landscape") mediaSize = mediaSize.asLandscape() }
        builder.setMediaSize(mediaSize)
          .setMinMargins(PrintAttributes.Margins.NO_MARGINS)
          .setResolution(PrintAttributes.Resolution("id", "label", PIXELS_PER_INCH, PIXELS_PER_INCH))
      }
      return builder.build()
    }

  private val webViewClient: WebViewClient = object : WebViewClient() {
    override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean = false

    override fun onPageFinished(view: WebView, url: String) {
      if (!fileRender) {
        // Preserve the existing generic printer adapter handoff. Its resources
        // must remain usable for PrintManager's later layout/write callbacks.
        val adapter = view.createPrintDocumentAdapter("Document")
        document = adapter
        adapter.onLayout(null, printAttributes, null, object : PrintDocumentAdapterLayoutCallback() {}, null)
        @SuppressLint("Range")
        val pageHeight = PIXELS_PER_MIL * printAttributes.mediaSize!!.heightMils
        numberOfPages = 1 + (view.contentHeight / pageHeight).toInt()
        callbacks?.onRenderFinished(adapter, null, numberOfPages)
        return
      }
      if (terminal || pageStarted || view !== webView) return
      pageStarted = true
      try {
        val adapter = view.createPrintDocumentAdapter("Document")
        document = adapter
        adapter.onStart()
        adapter.onLayout(null, printAttributes, cancellationSignal, object : PrintDocumentAdapterLayoutCallback() {
          override fun onLayoutFinished(info: PrintDocumentInfo, changed: Boolean) {
            onMain {
              if (terminal || layoutFinished) return@onMain
              layoutFinished = true
              try {
                @SuppressLint("Range")
                val pageHeight = PIXELS_PER_MIL * printAttributes.mediaSize!!.heightMils
                numberOfPages = if (info.pageCount > 0) info.pageCount else 1 + (view.contentHeight / pageHeight).toInt()
                adapter.onWrite(arrayOf(PageRange.ALL_PAGES), fileDescriptor, cancellationSignal, printDocumentWriteCallback)
              } catch (exception: Exception) {
                finishFile(UnexpectedPrintException("The report could not be written. Please try again.", exception))
              }
            }
          }

          override fun onLayoutFailed(error: CharSequence?) {
            finishFile(UnexpectedPrintException("The report could not be laid out. Please try again."))
          }

          override fun onLayoutCancelled() {
            finishFile(UnexpectedPrintException("Report preparation was cancelled. Please try again."))
          }
        }, null)
      } catch (exception: Exception) {
        finishFile(UnexpectedPrintException("The report could not be prepared. Please try again.", exception))
      }
    }

    override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
      if (fileRender && request.isForMainFrame && view === webView) {
        finishFile(UnexpectedPrintException("The report could not be loaded. Please try again."))
      } else if (!fileRender) {
        super.onReceivedError(view, request, error)
      }
    }

    override fun onRenderProcessGone(view: WebView, detail: RenderProcessGoneDetail): Boolean {
      if (!fileRender) return super.onRenderProcessGone(view, detail)
      // Only this task's affected WebView is released. Never manipulate other
      // WebViews which might share Chromium's renderer process.
      if (view === webView) finishFile(UnexpectedPrintException("Report preparation was interrupted. Please try again."))
      return true
    }
  }

  private val printDocumentWriteCallback: PrintDocumentAdapterWriteCallback = object : PrintDocumentAdapterWriteCallback() {
    override fun onWriteFinished(pages: Array<PageRange>) { finishFile(null) }
    override fun onWriteFailed(error: CharSequence?) {
      finishFile(UnexpectedPrintException("The report could not be written. Please try again."))
    }
    override fun onWriteCancelled() {
      finishFile(UnexpectedPrintException("Report preparation was cancelled. Please try again."))
    }
  }

  @UiThread
  private fun finishFile(error: CodedException?) {
    if (Looper.myLooper() != Looper.getMainLooper()) {
      mainHandler.post { finishFile(error) }
      return
    }
    if (!fileRender || terminal) return
    terminal = true
    mainHandler.removeCallbacks(watchdog)
    val finishedCallbacks = callbacks
    val finishedDocument = document
    val finishedOutput = outputFile
    val finishedDescriptor = fileDescriptor
    val finishedView = webView
    callbacks = null
    document = null
    outputFile = null
    fileDescriptor = null
    webView = null
    var failure = error
    fun cleanup(action: () -> Unit) {
      try { action() } catch (exception: Exception) {
        if (failure == null) failure = UnexpectedPrintException("The report could not be prepared. Please try again.", exception)
      }
    }
    if (error != null) cleanup { cancellationSignal.cancel() }
    cleanup { finishedDescriptor?.close() }
    cleanup { finishedDocument?.onFinish() }
    cleanup { finishedView?.stopLoading() }
    cleanup { (finishedView?.parent as? ViewGroup)?.removeView(finishedView) }
    // SDK36 requires a non-null client. Detach our task-capturing client
    // before destroying the view rather than assigning an illegal null.
    cleanup { finishedView?.webViewClient = WebViewClient() }
    cleanup { finishedView?.destroy() }
    if (failure == null && finishedDocument == null) failure = UnexpectedPrintException("The report could not be prepared. Please try again.")
    if (failure != null) {
      cleanup { finishedOutput?.delete() }
      finishedCallbacks?.onRenderError(failure!!)
    } else {
      finishedCallbacks?.onRenderFinished(finishedDocument!!, finishedOutput, numberOfPages)
    }
  }

  abstract class Callbacks {
    open fun onRenderFinished(document: PrintDocumentAdapter, outputFile: File?, numberOfPages: Int) = Unit
    open fun onRenderError(exception: CodedException) = Unit
  }
}
