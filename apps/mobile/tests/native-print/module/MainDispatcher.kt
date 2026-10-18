package expo.modules.print

import android.os.MainQueue
import kotlinx.coroutines.InternalCoroutinesApi
import kotlinx.coroutines.MainCoroutineDispatcher
import kotlinx.coroutines.internal.MainDispatcherFactory
import kotlin.coroutines.CoroutineContext

/** A deterministic Android boundary for the real coroutines Main dispatcher. */
class HarnessMainDispatcher : MainCoroutineDispatcher() {
  override val immediate: MainCoroutineDispatcher get() = this
  override fun isDispatchNeeded(context: CoroutineContext) = true
  override fun dispatch(context: CoroutineContext, block: Runnable) = MainQueue.schedule(block, 0)
}

@OptIn(InternalCoroutinesApi::class)
class HarnessMainDispatcherFactory : MainDispatcherFactory {
  override val loadPriority = Int.MAX_VALUE
  override fun createDispatcher(allFactories: List<MainDispatcherFactory>): MainCoroutineDispatcher = HarnessMainDispatcher()
  override fun hintOnError() = "The isolated test Main dispatcher must be on the service classpath"
}
