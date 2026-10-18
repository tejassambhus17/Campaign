package android.os

/** Deterministic scheduler at Android's boundary, with no renderer policy. */
class Looper private constructor(val name: String) {
  companion object {
    private val main = Looper("main")
    private val worker = Looper("worker")
    private val mainThread = Thread.currentThread()
    private val override = ThreadLocal<Looper?>()
    @JvmStatic fun getMainLooper() = main
    @JvmStatic fun myLooper(): Looper? = override.get() ?: if (Thread.currentThread() === mainThread) main else null
    fun <T> offMain(action: () -> T): T {
      val previous = override.get()
      override.set(worker)
      return try { action() } finally { override.set(previous) }
    }
    internal fun <T> onMain(action: () -> T): T {
      val previous = override.get()
      override.set(main)
      return try { action() } finally { override.set(previous) }
    }
  }
}

object MainQueue {
  data class Pending(val at: Long, val runnable: Runnable, val ordinal: Long)
  var now = 0L
    private set
  private var ordinal = 0L
  val pending = mutableListOf<Pending>()
  @Synchronized fun reset() { check(pending.isEmpty()) { "Previous task leaked a watchdog or UI callback" }; now = 0L }
  @Synchronized fun schedule(runnable: Runnable, delay: Long) { pending.add(Pending(now + delay, runnable, ordinal++)) }
  @Synchronized fun remove(runnable: Runnable) { pending.removeAll { it.runnable === runnable } }
  fun runOneReady(): Boolean {
    val next = synchronized(this) {
      pending.filter { it.at <= now }.minWithOrNull(compareBy<Pending> { it.at }.thenBy { it.ordinal })?.also { pending.remove(it) }
    } ?: return false
    Looper.onMain { next.runnable.run() }
    return true
  }
  fun runReady() { while (runOneReady()) Unit }
  fun advance(milliseconds: Long) { require(milliseconds >= 0); now += milliseconds; runReady() }
  fun assertMain() { check(Looper.myLooper() === Looper.getMainLooper()) { "Android resource/callback used off Main" } }
}

class Handler(@Suppress("UNUSED_PARAMETER") looper: Looper) {
  fun post(runnable: Runnable): Boolean { MainQueue.schedule(runnable, 0); return true }
  fun postDelayed(runnable: Runnable, delayMillis: Long): Boolean { MainQueue.schedule(runnable, delayMillis); return true }
  fun removeCallbacks(runnable: Runnable) { MainQueue.remove(runnable) }
}

open class Bundle
open class CancellationSignal {
  var isCanceled = false
    private set
  fun cancel() { isCanceled = true }
}

class ParcelFileDescriptor : java.io.Closeable {
  var closeCalls = 0
    private set
  var closeThrows: Throwable? = null
  var closeWasMain = false
    private set
  override fun close() { closeWasMain = Looper.myLooper() === Looper.getMainLooper(); closeCalls++; closeThrows?.let { throw it } }
  companion object {
    const val MODE_READ_WRITE = 0x38000000
    const val MODE_CREATE = 0x08000000
    const val MODE_TRUNCATE = 0x04000000
    const val MODE_WRITE_ONLY = 0x20000000
    val opened = mutableListOf<ParcelFileDescriptor>()
    var openThrows: java.io.IOException? = null
    var afterOpen: ((ParcelFileDescriptor) -> Unit)? = null
    @JvmStatic fun open(@Suppress("UNUSED_PARAMETER") file: java.io.File, @Suppress("UNUSED_PARAMETER") mode: Int): ParcelFileDescriptor {
      openThrows?.let { throw it }
      return ParcelFileDescriptor().also { opened.add(it); afterOpen?.invoke(it) }
    }
  }
}
