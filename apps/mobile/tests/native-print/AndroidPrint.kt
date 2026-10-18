package android.print

import android.os.Bundle
import android.os.CancellationSignal
import android.os.MainQueue
import android.os.ParcelFileDescriptor

class PageRange {
  companion object { val ALL_PAGES = PageRange() }
}

class PrintAttributes(val mediaSize: MediaSize?) {
  class Builder {
    private var media: MediaSize? = null
    fun setMediaSize(value: MediaSize) = apply { media = value }
    fun setMinMargins(@Suppress("UNUSED_PARAMETER") value: Margins) = this
    fun setResolution(@Suppress("UNUSED_PARAMETER") value: Resolution) = this
    fun build() = PrintAttributes(media)
  }
  class MediaSize(val id: String, val label: String, val widthMils: Int, val heightMils: Int) {
    fun asLandscape() = MediaSize(id, label, heightMils, widthMils)
  }
  class Margins { companion object { val NO_MARGINS = Margins() } }
  class Resolution(val id: String, val label: String, val horizontalDpi: Int, val verticalDpi: Int)
}

class PrintDocumentInfo(val pageCount: Int = 4)

open class PrintDocumentAdapter {
  open class LayoutResultCallback {
    open fun onLayoutFinished(info: PrintDocumentInfo, changed: Boolean) = Unit
    open fun onLayoutFailed(error: CharSequence?) = Unit
    open fun onLayoutCancelled() = Unit
  }
  open class WriteResultCallback {
    open fun onWriteFinished(pages: Array<PageRange>) = Unit
    open fun onWriteFailed(error: CharSequence?) = Unit
    open fun onWriteCancelled() = Unit
  }
  var layoutCalls = 0
  var startCalls = 0
  var writeCalls = 0
  var finishCalls = 0
  var layoutCallback: LayoutResultCallback? = null
  var writeCallback: WriteResultCallback? = null
  var layoutThrows: Throwable? = null
  var writeThrows: Throwable? = null
  var finishThrows: Throwable? = null
  val ordering = mutableListOf<String>()
  open fun onStart() { MainQueue.assertMain(); startCalls++; ordering.add("start") }
  open fun onLayout(oldAttributes: PrintAttributes?, newAttributes: PrintAttributes?, cancellationSignal: CancellationSignal?, callback: LayoutResultCallback, extras: Bundle?) {
    MainQueue.assertMain(); layoutCalls++; ordering.add("layout"); layoutCallback = callback
    layoutThrows?.let { throw it }
  }
  open fun onWrite(pages: Array<PageRange>, destination: ParcelFileDescriptor?, cancellationSignal: CancellationSignal?, callback: WriteResultCallback) {
    MainQueue.assertMain(); writeCalls++; ordering.add("write"); writeCallback = callback
    writeThrows?.let { throw it }
  }
  open fun onFinish() {
    MainQueue.assertMain(); finishCalls++; ordering.add("finish")
    finishThrows?.let { throw it }
  }
}

open class PrintDocumentAdapterLayoutCallback : PrintDocumentAdapter.LayoutResultCallback()
open class PrintDocumentAdapterWriteCallback : PrintDocumentAdapter.WriteResultCallback()
