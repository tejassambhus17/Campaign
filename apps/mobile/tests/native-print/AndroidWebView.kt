package android.webkit

import android.content.Context
import android.os.MainQueue
import android.print.PrintDocumentAdapter
import android.view.ViewGroup

open class WebResourceRequest(val isForMainFrame: Boolean = true)
open class WebResourceError(val description: CharSequence = "Synthetic boundary load error", val errorCode: Int = -2)
open class RenderProcessGoneDetail {
  open fun didCrash() = true
  open fun rendererPriorityAtExit() = 0
}

open class WebViewClient {
  open fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean = false
  open fun onPageFinished(view: WebView, url: String) = Unit
  open fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) = Unit
  open fun onReceivedError(view: WebView, errorCode: Int, description: String?, failingUrl: String?) = Unit
  open fun onRenderProcessGone(view: WebView, detail: RenderProcessGoneDetail): Boolean = false
}

class WebSettings {
  var defaultTextEncodingName = ""
  var textZoom = 100
  var javaScriptEnabled = false
}

open class WebView(@Suppress("UNUSED_PARAMETER") context: Context) {
  val settings = WebSettings()
  var firstAssignedClient: WebViewClient? = null
    private set
  var webViewClient: WebViewClient = WebViewClient()
    set(value) {
      MainQueue.assertMain()
      if (firstAssignedClient == null) firstAssignedClient = value
      field = value
    }
  var contentHeight = 720
  var parent: ViewGroup? = ViewGroup()
  val adapter: PrintDocumentAdapter = nextAdapter.also { nextAdapter = PrintDocumentAdapter() }
  var adapterCalls = 0
  var destroyCalls = 0
  var removeAllViewsCalls = 0
  var stopLoadingCalls = 0
  var clearHistoryCalls = 0
  val loadedUrls = mutableListOf<String>()
  init { MainQueue.assertMain(); instances.add(this) }
  open fun loadDataWithBaseURL(baseUrl: String?, data: String, mimeType: String, encoding: String, historyUrl: String?) {
    MainQueue.assertMain(); loadThrows?.let { throw it }
  }
  open fun createPrintDocumentAdapter(@Suppress("UNUSED_PARAMETER") name: String): PrintDocumentAdapter {
    MainQueue.assertMain(); adapterCalls++; adapterThrows?.let { throw it }; return adapter
  }
  open fun stopLoading() { MainQueue.assertMain(); stopLoadingCalls++ }
  open fun loadUrl(url: String) { MainQueue.assertMain(); loadedUrls.add(url) }
  open fun removeAllViews() { MainQueue.assertMain(); removeAllViewsCalls++ }
  open fun clearHistory() { MainQueue.assertMain(); clearHistoryCalls++ }
  open fun destroy() { MainQueue.assertMain(); destroyCalls++; destroyThrows?.let { throw it } }
  companion object {
    var nextAdapter = PrintDocumentAdapter()
    var loadThrows: Throwable? = null
    var adapterThrows: Throwable? = null
    var destroyThrows: Throwable? = null
    val instances = mutableListOf<WebView>()
    fun reset() {
      nextAdapter = PrintDocumentAdapter(); loadThrows = null; adapterThrows = null; destroyThrows = null
      instances.clear(); android.os.ParcelFileDescriptor.opened.clear()
      android.os.ParcelFileDescriptor.openThrows = null; android.os.ParcelFileDescriptor.afterOpen = null
    }
  }
}
