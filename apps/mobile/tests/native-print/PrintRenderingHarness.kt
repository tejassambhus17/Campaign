package expo.modules.print

import android.content.Context
import android.os.Looper
import android.os.MainQueue
import android.os.ParcelFileDescriptor
import android.print.PageRange
import android.print.PrintDocumentAdapter
import android.print.PrintDocumentInfo
import android.webkit.RenderProcessGoneDetail
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import expo.modules.kotlin.exception.CodedException
import java.io.File

/** Exercises the compiled production renderer; doubles only expose Android events. */
private class Results : PrintPDFRenderTask.Callbacks() {
  var successes = 0
  val errors = mutableListOf<CodedException>()
  var returnedFile: File? = null
  var returnedAdapter: PrintDocumentAdapter? = null
  var returnedPages = 0
  override fun onRenderFinished(document: PrintDocumentAdapter, outputFile: File?, numberOfPages: Int) {
    MainQueue.assertMain()
    successes++
    returnedFile = outputFile
    returnedAdapter = document
    returnedPages = numberOfPages
    check(numberOfPages > 0)
  }
  override fun onRenderError(exception: CodedException) {
    MainQueue.assertMain()
    errors.add(exception)
    check(!exception.message.isNullOrBlank()) { "Failure must be actionable rather than empty" }
  }
}

private data class Session(
  val task: PrintPDFRenderTask,
  val file: File?,
  val descriptor: ParcelFileDescriptor?,
  val results: Results,
  val view: WebView,
  val client: WebViewClient,
  val adapter: PrintDocumentAdapter,
)

private lateinit var directory: File
private var sequence = 0
private var passed = 0
private fun worker(action: () -> Unit) {
  var error: Throwable? = null
  val thread = Thread { try { action() } catch (caught: Throwable) { error = caught } }
  thread.start(); thread.join(5000); check(!thread.isAlive) { "Worker callback did not return" }
  error?.let { throw it }
}

private fun reset() { MainQueue.reset(); WebView.reset() }
private fun scenario(name: String, action: () -> Unit) {
  reset()
  action()
  check(MainQueue.pending.isEmpty()) { "$name leaked scheduled work: ${MainQueue.pending}" }
  passed++
  println("PASS $name")
}

private fun session(generic: Boolean = false, adapter: PrintDocumentAdapter = PrintDocumentAdapter()): Session {
  WebView.nextAdapter = adapter
  val task = PrintPDFRenderTask(Context(), PrintOptions())
  val file = if (generic) null else File(directory, "render-${sequence++}.pdf").also { it.writeText("disposable partial file") }
  val descriptor = if (generic) null else ParcelFileDescriptor()
  val results = Results()
  task.render(file, descriptor, results)
  val view = WebView.instances.last()
  return Session(task, file, descriptor, results, view, checkNotNull(view.firstAssignedClient), adapter)
}

private fun page(s: Session) { s.client.onPageFinished(s.view, "about:blank"); MainQueue.runReady() }
private fun layout(s: Session) { checkNotNull(s.adapter.layoutCallback).onLayoutFinished(PrintDocumentInfo(), true); MainQueue.runReady() }
private fun write(s: Session) { checkNotNull(s.adapter.writeCallback).onWriteFinished(arrayOf(PageRange.ALL_PAGES)); MainQueue.runReady() }
private fun expectFailure(s: Session, adapterCreated: Boolean = true) {
  check(s.results.successes == 0 && s.results.errors.size == 1)
  check(s.descriptor?.closeCalls == 1) { "Descriptor not closed exactly once" }
  check(s.descriptor?.closeWasMain == true) { "Renderer descriptor cleanup was off Main" }
  check(s.view.destroyCalls == 1) { "Owned renderer not destroyed exactly once" }
  check(s.view.webViewClient !== s.view.firstAssignedClient && s.view.parent == null) { "Failed renderer retained its task client or parent" }
  check(!checkNotNull(s.file).exists()) { "Partial output survived a failed export" }
  check(s.adapter.finishCalls == if (adapterCreated) 1 else 0)
}
private fun expectSuccess(s: Session) {
  check(s.results.successes == 1 && s.results.errors.isEmpty())
  check(s.descriptor?.closeCalls == 1 && s.adapter.finishCalls == 1 && s.view.destroyCalls == 1)
  check(s.descriptor?.closeWasMain == true)
  check(checkNotNull(s.file).exists()) { "Successful PDF was deleted" }
  check(s.results.returnedFile == s.file && s.results.returnedAdapter === s.adapter)
  check(s.results.returnedPages == 4 && s.view.webViewClient !== s.view.firstAssignedClient && s.view.parent == null)
  check(s.adapter.ordering == listOf("start", "layout", "write", "finish"))
}

fun main(args: Array<String>) {
  directory = File(args.single()).canonicalFile
  check(directory.isDirectory)

  scenario("layout completion gates write and success cleans exactly once") {
    val s = session(); page(s)
    check(s.adapter.layoutCalls == 1 && s.adapter.writeCalls == 0 && s.results.successes == 0)
    layout(s); check(s.adapter.writeCalls == 1 && s.results.successes == 0)
    write(s); expectSuccess(s)
  }
  scenario("duplicate page, layout and write callbacks do not duplicate work or terminal") {
    val s = session(); page(s); page(s)
    check(s.view.adapterCalls == 1 && s.adapter.layoutCalls == 1)
    layout(s); layout(s); check(s.adapter.writeCalls == 1)
    write(s); write(s); page(s)
    s.adapter.layoutCallback!!.onLayoutFailed("late")
    s.adapter.writeCallback!!.onWriteFailed("late")
    MainQueue.runReady(); expectSuccess(s)
  }
  scenario("ten consecutive independent exports leave no active renderer or watchdog") {
    repeat(10) {
      val s = session(); page(s); layout(s); write(s); expectSuccess(s)
      check(MainQueue.pending.isEmpty())
    }
    check(WebView.instances.size == 10 && WebView.instances.all { it.destroyCalls == 1 })
  }
  scenario("renderer loss before page completion rejects once and ignores late page") {
    val s = session()
    check(s.client.onRenderProcessGone(s.view, RenderProcessGoneDetail()))
    MainQueue.runReady(); expectFailure(s, false)
    page(s); s.task.cancel(); MainQueue.runReady()
    check(s.view.adapterCalls == 0 && s.results.errors.size == 1 && s.view.destroyCalls == 1)
  }
  scenario("renderer loss during layout rejects once and ignores late success") {
    val s = session(); page(s)
    check(s.client.onRenderProcessGone(s.view, RenderProcessGoneDetail()))
    MainQueue.runReady(); expectFailure(s)
    layout(s); page(s); check(s.adapter.writeCalls == 0 && s.results.errors.size == 1)
  }
  scenario("renderer loss during write rejects once and ignores late write and timeout") {
    val s = session(); page(s); layout(s)
    check(s.client.onRenderProcessGone(s.view, RenderProcessGoneDetail()))
    MainQueue.runReady(); expectFailure(s)
    write(s); MainQueue.advance(45000); expectFailure(s)
  }
  scenario("watchdog is exactly45 seconds and closes a hung page load") {
    val s = session()
    check(MainQueue.pending.single().at - MainQueue.now == 45000L)
    MainQueue.advance(44999); check(s.results.errors.isEmpty() && s.view.destroyCalls == 0)
    MainQueue.advance(1); expectFailure(s, false)
    page(s); check(s.adapter.writeCalls == 0 && s.results.errors.size == 1)
  }
  scenario("watchdog also terminates a hung layout") {
    val s = session(); page(s); MainQueue.advance(45000); expectFailure(s)
    layout(s); check(s.adapter.writeCalls == 0)
  }
  scenario("watchdog also terminates a hung write") {
    val s = session(); page(s); layout(s); MainQueue.advance(45000); expectFailure(s)
    write(s); expectFailure(s)
  }
  scenario("main-frame load error rejects and subresource error does not") {
    val s = session()
    s.client.onReceivedError(s.view, WebResourceRequest(false), WebResourceError())
    MainQueue.runReady(); check(s.results.errors.isEmpty() && s.view.destroyCalls == 0)
    s.client.onReceivedError(s.view, WebResourceRequest(true), WebResourceError())
    MainQueue.runReady(); expectFailure(s, false)
  }
  scenario("layout error and cancellation independently close output") {
    for (cancelled in listOf(false, true)) {
      val s = session(); page(s)
      if (cancelled) s.adapter.layoutCallback!!.onLayoutCancelled() else s.adapter.layoutCallback!!.onLayoutFailed("boundary failure")
      MainQueue.runReady(); expectFailure(s)
      layout(s); check(s.adapter.writeCalls == 0)
    }
  }
  scenario("write error and cancellation independently close output") {
    for (cancelled in listOf(false, true)) {
      val s = session(); page(s); layout(s)
      if (cancelled) s.adapter.writeCallback!!.onWriteCancelled() else s.adapter.writeCallback!!.onWriteFailed("boundary failure")
      MainQueue.runReady(); expectFailure(s); write(s); expectFailure(s)
    }
  }
  scenario("off-Main cancellation before page is marshalled to Main and rejects once") {
    val s = session()
    Looper.offMain { s.task.cancel(); check(s.view.destroyCalls == 0 && s.results.errors.isEmpty()) }
    MainQueue.runReady(); expectFailure(s, false)
    page(s); s.task.cancel(); MainQueue.runReady(); check(s.results.errors.size == 1)
  }
  scenario("off-Main cancellation during write ignores late completion") {
    val s = session(); page(s); layout(s)
    Looper.offMain { s.task.cancel(); check(s.view.destroyCalls == 0) }
    MainQueue.runReady(); expectFailure(s); write(s); expectFailure(s)
  }
  scenario("cancellation before render rejects later file request without creating a WebView") {
    val task = PrintPDFRenderTask(Context(), PrintOptions())
    val file = File(directory, "pre-cancel-${sequence++}.pdf").also { it.writeText("partial") }
    val descriptor = ParcelFileDescriptor(); val results = Results()
    Looper.offMain { task.cancel() }; MainQueue.runReady()
    check(results.errors.isEmpty() && WebView.instances.isEmpty())
    task.render(file, descriptor, results)
    check(results.errors.size == 1 && results.successes == 0 && descriptor.closeCalls == 1 && !file.exists())
    check(WebView.instances.isEmpty())
  }
  scenario("another WebView renderer callback does not clean this task or the unrelated view") {
    val s = session(); val other = WebView(Context())
    s.client.onRenderProcessGone(other, RenderProcessGoneDetail())
    MainQueue.runReady()
    check(s.results.errors.isEmpty() && s.view.destroyCalls == 0 && other.destroyCalls == 0)
    page(s); layout(s); write(s); expectSuccess(s)
    check(other.destroyCalls == 0)
  }
  scenario("descriptor-only rendering keeps file-mode sequencing and cleanup") {
    val task = PrintPDFRenderTask(Context(), PrintOptions())
    val descriptor = ParcelFileDescriptor(); val results = Results()
    task.render(null, descriptor, results)
    val view = WebView.instances.last(); val client = checkNotNull(view.firstAssignedClient)
    check(MainQueue.pending.single().at - MainQueue.now == 45000L)
    client.onPageFinished(view, "about:blank"); check(view.adapter.writeCalls == 0)
    view.adapter.layoutCallback!!.onLayoutFinished(PrintDocumentInfo(), true)
    check(view.adapter.writeCalls == 1)
    view.adapter.writeCallback!!.onWriteFinished(arrayOf(PageRange.ALL_PAGES))
    check(results.successes == 1 && results.errors.isEmpty() && results.returnedFile == null)
    check(descriptor.closeCalls == 1 && view.adapter.finishCalls == 1 && view.destroyCalls == 1)
  }
  scenario("output-file-only rendering never becomes generic handoff and remains cancellable") {
    val task = PrintPDFRenderTask(Context(), PrintOptions())
    val file = File(directory, "output-only-${sequence++}.pdf").also { it.writeText("partial") }
    val results = Results(); task.render(file, null, results)
    val view = WebView.instances.last()
    check(MainQueue.pending.single().at - MainQueue.now == 45000L)
    view.firstAssignedClient!!.onPageFinished(view, "about:blank")
    check(results.successes == 0 && view.adapter.writeCalls == 0)
    task.cancel(); MainQueue.runReady()
    check(results.errors.size == 1 && results.successes == 0 && !file.exists())
    check(view.adapter.finishCalls == 1 && view.destroyCalls == 1)
  }
  scenario("cleanup exceptions still settle once and attempt all remaining resource cleanup") {
    for (stage in listOf("close", "finish", "destroy")) {
      val s = session(); page(s); layout(s)
      if (stage == "close") s.descriptor!!.closeThrows = IllegalStateException("Boundary close failure")
      if (stage == "finish") s.adapter.finishThrows = IllegalStateException("Boundary finish failure")
      if (stage == "destroy") WebView.destroyThrows = IllegalStateException("Boundary destroy failure")
      write(s); expectFailure(s); write(s)
      check(s.results.errors.size == 1 && s.view.destroyCalls == 1)
      WebView.destroyThrows = null
    }
  }
  scenario("synchronous WebView loading exception rejects without leaking descriptor") {
    WebView.loadThrows = IllegalStateException("Boundary load failure")
    val s = session(); MainQueue.runReady(); expectFailure(s, false)
  }
  scenario("synchronous adapter, layout and write exceptions reject once") {
    for (stage in listOf("adapter", "layout", "write")) {
      val adapter = PrintDocumentAdapter()
      if (stage == "adapter") WebView.adapterThrows = IllegalStateException("Boundary adapter failure")
      if (stage == "layout") adapter.layoutThrows = IllegalStateException("Boundary layout failure")
      if (stage == "write") adapter.writeThrows = IllegalStateException("Boundary write failure")
      val s = session(adapter = adapter); page(s)
      if (stage == "write") layout(s)
      MainQueue.runReady(); expectFailure(s, stage != "adapter")
      WebView.adapterThrows = null
    }
  }
  scenario("worker-thread layout completion starts writing only on Main") {
    val s = session(); page(s)
    worker {
      s.adapter.layoutCallback!!.onLayoutFinished(PrintDocumentInfo(), true)
      s.adapter.layoutCallback!!.onLayoutFinished(PrintDocumentInfo(), true)
      check(s.adapter.writeCalls == 0 && s.view.destroyCalls == 0)
    }
    MainQueue.runReady(); check(s.adapter.writeCalls == 1)
    write(s); expectSuccess(s)
  }
  scenario("worker-thread write success and failure race settles once on Main") {
    for (successFirst in listOf(true, false)) {
      val s = session(); page(s); layout(s)
      worker {
        if (successFirst) {
          s.adapter.writeCallback!!.onWriteFinished(arrayOf(PageRange.ALL_PAGES))
          s.adapter.writeCallback!!.onWriteFailed("late failure")
        } else {
          s.adapter.writeCallback!!.onWriteFailed("first failure")
          s.adapter.writeCallback!!.onWriteFinished(arrayOf(PageRange.ALL_PAGES))
        }
        check(s.descriptor!!.closeCalls == 0 && s.view.destroyCalls == 0)
      }
      MainQueue.runReady()
      if (successFirst) expectSuccess(s) else expectFailure(s)
    }
  }
  scenario("generic print hands off a live adapter without file watchdog or eager destruction") {
    val s = session(generic = true)
    check(MainQueue.pending.isEmpty()); page(s)
    check(s.results.successes == 1 && s.results.errors.isEmpty() && s.results.returnedFile == null)
    check(s.results.returnedAdapter === s.adapter && s.adapter.layoutCalls == 1 && s.adapter.writeCalls == 0)
    check(s.adapter.finishCalls == 0 && s.view.destroyCalls == 0 && MainQueue.pending.isEmpty())
    s.task.cancel(); MainQueue.runReady()
    check(s.adapter.finishCalls == 0 && s.view.destroyCalls == 0 && s.results.errors.isEmpty())
  }
  println("$passed executable native renderer scenarios passed")
}
