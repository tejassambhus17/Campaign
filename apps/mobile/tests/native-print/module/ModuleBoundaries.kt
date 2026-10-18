package expo.modules.print

import android.content.Context
import java.io.File
import java.io.IOException
import java.util.Base64

/** File/Expo boundaries only. The coroutine ownership logic is extracted unchanged. */
internal object ModuleBoundary {
  var onContext: (() -> Unit)? = null
}
internal data class FilePrintResult(val uri: String, val numberOfPages: Int, val base64: String?)
internal object FileUtils {
  lateinit var directory: File
  val generated = mutableListOf<File>()
  var sequence = 0
  var generateThrows: IOException? = null
  var encodeThrows: Exception? = null
  fun reset() { generated.clear(); generateThrows = null; encodeThrows = null; ModuleBoundary.onContext = null }
  fun generateFilePath(@Suppress("UNUSED_PARAMETER") context: Context): String {
    generateThrows?.let { throw it }
    return File(directory, "module-${sequence++}.pdf").also { generated.add(it) }.absolutePath
  }
  fun uriFromFile(file: File?) = checkNotNull(file).toURI()
  fun encodeFromFile(file: File): String { encodeThrows?.let { throw it }; return Base64.getEncoder().encodeToString(file.readBytes()) }
}
