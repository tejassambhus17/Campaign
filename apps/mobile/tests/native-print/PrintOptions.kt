package expo.modules.print

/** Only the external options used by the exact upstream renderer. */
internal class PrintOptions {
  var html: String? = "<html><body>Disposable renderer test</body></html>"
  var textZoom: Int? = null
  var width: Int? = null
  var height: Int? = null
  var orientation: String? = null
  var base64: Boolean = false
}
