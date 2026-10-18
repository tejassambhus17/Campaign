# Expo activity-result host rebinding

This local Android correction is limited to `expo-modules-core` **55.0.26**.
The existing SDK55 dependencies and React Native 0.83.10 are unchanged.

`AppContext.kt.patch.json` is the executable patch source; the adjacent unified
diff is the same change for review. Both original and resulting SHA256 values
are pinned in the JSON. Unexpected package versions or source bytes fail closed.
The patch is applied by mobile `npm` postinstall, the Android CNG plugin, and the
existing local build launcher before it checks its native configuration stamp.
No manual edit of ignored generated Android files is needed.

The original file is from the npm package locked in `package-lock.json`:

- Package: `expo-modules-core@55.0.26`
- Archive: <https://registry.npmjs.org/expo-modules-core/-/expo-modules-core-55.0.26.tgz>
- npm integrity: `sha512-nyQMIlNuAEif2kZEjaRiWxZsGyT8/pFm7VPwlYI92a0hyRxXrw3jG04I1OgfKy6oDFqMLn17D5C2zIGPP/fPLQ==`
- Upstream repository: <https://github.com/expo/expo/tree/main/packages/expo-modules-core>
- Source: `android/src/main/java/expo/modules/kotlin/AppContext.kt`
- Original SHA256: `1a0e42e937256c4fa35857816fe7b07c2df7d08b1e038bf5c87a948db97c6430`
- Patched SHA256: `0444319849a45c12bc7b2e8bf1eb5d92e48e0b96d3280a2e2c01e12bb4b6bea0`
- License: MIT, Copyright (c) 2015-present 650 Industries, Inc. (aka Expo).
  Full license is adjacent in `LICENSE-MIT.txt`; identical full Expo MIT text is
  already bundled in all APK variants as `assets/licenses/Expo-MIT.txt`.

Expo's activity delegate can defer an old host's destruction. ReactHost guards
destruction by Activity identity, so an old host can be ignored after the new
Activity resumed. The surviving module can then retain launchers whose old
LifecycleOwner destroyed/unregistered them, even when `hostWasDestroyed` did not
become true. This patch tracks the last resumed host weakly and re-registers
contracts when that identity changes, including when the prior weak reference
was cleared. It publishes the new host to the result manager first. An ordinary
same-host resume does not register again; neither does first resume unless the
existing destruction flag requires it.

The rejected manifest `fontScale` override is removed. Android handles font-size
configuration changes through normal Activity recreation, preserving React
Native's fresh text-layout context. Text scaling is never disabled. No app
session, draft, business rule, permissions, SDK version or backend changes here.

The focused tests execute the exact patched Kotlin resume method using the
project-local JDK/Kotlin compiler and small Android-boundary doubles. This proves
the tested policy branches, not installed Android lifecycle behavior. Acceptance
requires native larger-text layout and picker cancel/select/upload checks after
real Activity recreation; build/source tests alone are insufficient.
