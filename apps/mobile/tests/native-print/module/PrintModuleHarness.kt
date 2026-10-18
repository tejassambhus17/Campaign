package expo.modules.print

import android.os.Looper
import android.os.MainQueue
import android.os.ParcelFileDescriptor
import android.print.PageRange
import android.print.PrintDocumentAdapter
import android.print.PrintDocumentInfo
import android.webkit.WebView
import expo.modules.kotlin.exception.CodedException
import java.io.File
import java.io.IOException
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.async
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.suspendCancellableCoroutine

private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
private var passed = 0
private fun pumpUntil(condition: () -> Boolean) {
  val deadline = System.nanoTime() + 5_000_000_000L
  while (!condition()) {
    check(System.nanoTime() < deadline) { "Real coroutine did not reach the expected boundary" }
    if (!MainQueue.runOneReady()) Thread.sleep(1)
  }
}
private fun <T> result(job: Deferred<T>): T { pumpUntil { job.isCompleted }; return runBlocking { job.await() } }
private fun failure(job: Deferred<*>, cancelled: Boolean = false) {
  val error = runCatching { result(job) }.exceptionOrNull()
  check(if (cancelled) error is CancellationException else error is CodedException) { "Unexpected failure: $error" }
}
private fun scenario(name: String, block: () -> Unit) {
  MainQueue.reset(); WebView.reset(); FileUtils.reset(); block(); MainQueue.runReady()
  check(MainQueue.pending.isEmpty()) { "$name leaked scheduled work" }
  passed++; println("PASS $name")
}
private fun start(options: PrintOptions = PrintOptions()) = scope.async { PrintModuleUnderTest().execute(options) }
private fun ready(job: Deferred<*>): WebView {
  pumpUntil { WebView.instances.isNotEmpty() || job.isCompleted }
  check(!job.isCompleted) { "Module settled before rendering" }
  return WebView.instances.last()
}
private fun page(view: WebView) { view.firstAssignedClient!!.onPageFinished(view, "about:blank") }
private fun layout(view: WebView) { view.adapter.layoutCallback!!.onLayoutFinished(PrintDocumentInfo(), true) }
private fun write(view: WebView) { view.adapter.writeCallback!!.onWriteFinished(arrayOf(PageRange.ALL_PAGES)) }
private fun cleaned(view: WebView, fileKept: Boolean) {
  check(view.destroyCalls == 1 && view.adapter.finishCalls == 1 && view.webViewClient !== view.firstAssignedClient && view.parent == null)
  check(ParcelFileDescriptor.opened.single().let { it.closeCalls == 1 && it.closeWasMain })
  check(FileUtils.generated.single().exists() == fileKept)
}

fun main(args: Array<String>) {
  FileUtils.directory = File(args.single()).canonicalFile
  check(FileUtils.directory.isDirectory)
  // Initialize the Android Main boundary on this deterministic pump thread.
  check(Looper.myLooper() === Looper.getMainLooper())

  scenario("real IO/Main success returns URI and keeps the completed file") {
    val job = start(); val view = ready(job); page(view); layout(view); write(view)
    val actual = checkNotNull(result(job))
    check(actual.numberOfPages == 4 && actual.base64 == null && actual.uri.startsWith("file:"))
    cleaned(view, true)
  }
  scenario("eight repeated exports release each descriptor and renderer") {
    repeat(8) {
      val job = start(); pumpUntil { WebView.instances.size == it + 1 || job.isCompleted }
      val view = WebView.instances.last(); page(view); layout(view); write(view)
      check(result(job)?.numberOfPages == 4)
    }
    check(ParcelFileDescriptor.opened.size == 8 && ParcelFileDescriptor.opened.all { it.closeCalls == 1 && it.closeWasMain })
    check(WebView.instances.all { it.destroyCalls == 1 } && FileUtils.generated.all { it.exists() })
  }
  scenario("IO path preparation failure settles before a renderer exists") {
    FileUtils.generateThrows = IOException("Disposable path failure")
    failure(start()); check(WebView.instances.isEmpty() && ParcelFileDescriptor.opened.isEmpty() && FileUtils.generated.isEmpty())
  }
  scenario("IO descriptor open failure removes only its partial output") {
    ParcelFileDescriptor.openThrows = IOException("Disposable open failure")
    failure(start()); check(WebView.instances.isEmpty() && ParcelFileDescriptor.opened.isEmpty())
    check(FileUtils.generated.single().exists().not())
  }
  scenario("cancellation after real IO file open and before Main render closes untransferred descriptor") {
    lateinit var job: Deferred<FilePrintResult?>
    ParcelFileDescriptor.afterOpen = { job.cancel() }
    job = start(); failure(job, true)
    check(WebView.instances.isEmpty() && ParcelFileDescriptor.opened.single().closeCalls == 1)
    check(FileUtils.generated.single().exists().not())
  }
  scenario("cancellation immediately before handler registration uses task pre-render cleanup") {
    lateinit var job: Deferred<FilePrintResult?>
    ModuleBoundary.onContext = { if (Looper.myLooper() === Looper.getMainLooper()) job.cancel() }
    job = start(); failure(job, true)
    check(WebView.instances.isEmpty())
    check(ParcelFileDescriptor.opened.single().let { it.closeCalls == 1 && it.closeWasMain })
    check(FileUtils.generated.single().exists().not())
  }
  scenario("cancellation during active write rejects promptly and ignores late completion") {
    val job = start(); val view = ready(job); page(view); layout(view)
    Looper.offMain { job.cancel() }; failure(job, true)
    write(view); MainQueue.runReady(); cleaned(view, false)
  }
  scenario("base64 boundary failure rejects cleanly after native resources close") {
    FileUtils.encodeThrows = IOException("Disposable base64 failure")
    val options = PrintOptions().apply { base64 = true }
    val job = start(options); val view = ready(job); page(view); layout(view); write(view)
    failure(job); cleaned(view, false)
  }
  scenario("base64 success uses the actual optional conversion branch") {
    val options = PrintOptions().apply { base64 = true }
    val job = start(options); val view = ready(job)
    FileUtils.generated.single().writeText("disposable boundary bytes")
    page(view); layout(view); write(view)
    check(checkNotNull(result(job)).base64 == "ZGlzcG9zYWJsZSBib3VuZGFyeSBieXRlcw==")
    cleaned(view, true)
  }
  scenario("renderer failure reaches the real continuation and late callbacks remain ignored") {
    val job = start(); val view = ready(job); page(view); layout(view)
    view.adapter.writeCallback!!.onWriteFailed("Disposable write failure")
    failure(job); write(view); MainQueue.runReady(); cleaned(view, false)
  }
  scenario("cancellation after resume but before dispatcher delivery removes undelivered PDF") {
    val job = start(); val view = ready(job); page(view); layout(view); write(view)
    check(!job.isCompleted && FileUtils.generated.single().exists())
    job.cancel(); failure(job, true); cleaned(view, false)
  }
  scenario("real renderer duplicate and late callbacks cannot duplicate module delivery") {
    val job = start(); val view = ready(job); page(view); page(view); layout(view); layout(view)
    write(view); write(view); view.adapter.writeCallback!!.onWriteFailed("late")
    check(result(job)?.numberOfPages == 4); cleaned(view, true)
  }
  scenario("late callback after continuation cancellation cannot retain private output") {
    var callbacks: PrintPDFRenderTask.Callbacks? = null
    val module = PrintModuleUnderTest()
    val job = scope.async {
      suspendCancellableCoroutine<FilePrintResult> { continuation -> callbacks = module.callbacks(PrintOptions(), continuation) }
    }
    pumpUntil { callbacks != null }; job.cancel(); failure(job, true)
    val file = File(FileUtils.directory, "cancelled-late.pdf").also { it.writeText("disposable") }
    checkNotNull(callbacks).onRenderFinished(PrintDocumentAdapter(), file, 1)
    checkNotNull(callbacks).onRenderError(UnexpectedPrintException("late"))
    check(!file.exists())
  }
  scenario("duplicate callback before and after delivery preserves the successful result file") {
    var callbacks: PrintPDFRenderTask.Callbacks? = null
    val module = PrintModuleUnderTest()
    val job = scope.async {
      suspendCancellableCoroutine<FilePrintResult> { continuation -> callbacks = module.callbacks(PrintOptions(), continuation) }
    }
    pumpUntil { callbacks != null }
    val file = File(FileUtils.directory, "duplicate-success.pdf").also { it.writeText("disposable") }
    val boundary = checkNotNull(callbacks)
    boundary.onRenderFinished(PrintDocumentAdapter(), file, 2)
    boundary.onRenderFinished(PrintDocumentAdapter(), file, 2)
    check(file.exists()) { "Duplicate callback deleted the resumed successful PDF before delivery" }
    check(result(job).numberOfPages == 2)
    boundary.onRenderFinished(PrintDocumentAdapter(), file, 2)
    boundary.onRenderError(UnexpectedPrintException("late"))
    check(file.exists()) { "Late duplicate callback deleted an already delivered successful PDF" }
  }
  println("$passed executable native module scenarios passed")
}
