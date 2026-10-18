package android.view

import android.os.MainQueue
import android.webkit.WebView

open class ViewGroup {
  var removeCalls = 0
  open fun removeView(view: WebView?) {
    MainQueue.assertMain(); removeCalls++
    view?.parent = null
  }
}
