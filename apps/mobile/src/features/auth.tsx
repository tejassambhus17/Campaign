import { useCallback, useRef, useState } from "react";
import { BackHandler, Image, Keyboard, Platform, Pressable, ScrollView, TextInput, useWindowDimensions, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ConnectionHint, fonts, IconButton, Notice, Text, useTheme } from "../components/ui";
import { useSession } from "../lib/session";
import { CampaignAuthBrand } from "./Brand";
import { AuthAction, AuthBackdrop, AuthDivider, AuthField } from "./auth/AuthControls";

type AuthMode = "welcome" | "login" | "register";
const slides = [
  { image: require("../../assets/images/showcase/ocean-turtle.png"), label: "Illustrative sea turtle above a coral reef", caption: "A brighter tomorrow\nis a shared effort.", ratio: 1.5 },
  { image: require("../../assets/images/create/story-mountains.png"), label: "Illustrative mountain landscape", caption: "Every big change\nstarts with a story.", ratio: 2 },
  { image: require("../../assets/images/create/confirmation-coast.png"), label: "Illustrative coastal landscape", caption: "Small ideas.\nBigger possibilities.", ratio: 2 },
];

export function AuthForm({ initialMode = "welcome", onHelp, onModeChange, active = true }: {
  initialMode?: AuthMode;
  onHelp?: () => void;
  /** Existing caller compatibility; shared appearance remains available in Settings. */
  onAppearance?: () => void;
  onModeChange?: () => void;
  active?: boolean;
}) {
  const { colors } = useTheme();
  const { width, height, fontScale } = useWindowDimensions();
  const session = useSession();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [slide, setSlide] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [visiblePassword, setVisiblePassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const emailInput = useRef<TextInput>(null);
  const passwordInput = useRef<TextInput>(null);
  const formScroll = useRef<ScrollView>(null);

  const changeMode = useCallback((next: AuthMode) => {
    if (busy) return;
    Keyboard.dismiss();
    setMode(next);
    setError("");
    setVisiblePassword(false);
    onModeChange?.();
    formScroll.current?.scrollTo({ y: 0, animated: false });
  }, [busy, onModeChange]);

  useFocusEffect(useCallback(() => {
    if (!active || mode === "welcome") return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!busy) changeMode("welcome");
      return true;
    });
    return () => subscription.remove();
  }, [active, busy, changeMode, mode]));

  async function submit() {
    if (busy) return;
    if (mode === "register" && !name.trim()) {
      setError("Enter your name to create an account.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address to continue.");
      emailInput.current?.focus();
      return;
    }
    if (mode === "register" && password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      passwordInput.current?.focus();
      return;
    }
    setBusy(true);
    setError("");
    Keyboard.dismiss();
    try {
      if (mode === "register") await session.register(name.trim(), email.trim(), password);
      else await session.login(email.trim(), password, remember);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const guest = () => { Keyboard.dismiss(); router.push("/explore"); };
  const canSubmit = !!email.trim() && !!password && (mode !== "register" || !!name.trim());
  const isRegister = mode === "register";
  const currentSlide = slides[slide];
  const heroHeight = width < 390 || height < 900 || fontScale >= 1.25 ? 176 : 190;

  return <AuthBackdrop active={active}>
    <ScrollView ref={formScroll} style={{ flex: 1 }} keyboardShouldPersistTaps={Platform.OS === "android" ? "always" : "handled"} keyboardDismissMode={Platform.OS === "android" ? "none" : "on-drag"}
      contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 22, paddingTop: mode === "welcome" ? 20 : 0, paddingBottom: 20 }}>
      <View style={{ width: "100%", maxWidth: 420, alignSelf: "center", flexGrow: 1 }}>
        {mode !== "welcome" && <View style={{ flexDirection: "row", alignItems: "center", minHeight: 48, marginHorizontal: -10 }}>
          <IconButton label="Back to welcome" icon="arrow-back" onPress={() => changeMode("welcome")} disabled={busy} />
        </View>}

        {mode === "welcome" ? <>
          <View style={{ alignItems: "flex-start", marginBottom: 18 }}><CampaignAuthBrand horizontal /></View>
          <Text accessibilityRole="header" style={{ fontFamily: fonts.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.65, color: colors.ink }}>Good ideas{"\n"}deserve to be heard.</Text>
          <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 8 }}>Create campaigns that help important messages reach more people through community-funded advertising.</Text>
          <View style={{ height: heroHeight, marginTop: 16, borderRadius: 15, overflow: "hidden", backgroundColor: colors.paper }}>
            <Image source={currentSlide.image} accessibilityRole="image" accessibilityLabel={currentSlide.label} accessibilityIgnoresInvertColors
              resizeMode="cover" style={slide === 0 ? { width: "100%", height: undefined, aspectRatio: currentSlide.ratio } : { width: "100%", height: "100%" }} />
            <View pointerEvents="none" style={{ position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, backgroundColor: "rgba(0,0,0,0.57)" }}>
              <View style={{ width: 31, height: 2, backgroundColor: "#8EF4C5", marginBottom: 7 }} />
              <Text style={{ color: "#FFFFFF", fontFamily: fonts.semibold, fontSize: 12, lineHeight: 17 }}>{currentSlide.caption}</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", minHeight: 48 }}>
            {slides.map((item, index) => <Pressable key={item.caption} accessibilityRole="button" accessibilityLabel={`Show illustration ${index + 1} of ${slides.length}: ${item.caption.replace("\n", " ")}`}
              accessibilityState={{ selected: slide === index }} onPress={() => setSlide(index)} style={{ width: 48, height: 48, alignItems: "center", justifyContent: "center" }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: slide === index ? colors.green : colors.outline, opacity: slide === index ? 1 : 0.55 }} />
            </Pressable>)}
          </View>
          <View style={{ gap: 5 }}>
            <AuthAction title="Get Started" arrow onPress={() => changeMode("register")} />
            <AuthDivider />
            <AuthAction title="Sign In" variant="outline" onPress={() => changeMode("login")} />
            <AuthAction title="Continue as guest" variant="text" onPress={guest} />
          </View>
          <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: "center", marginTop: 13 }}>Real people. Real stories. Real impact.</Text>
        </> : <>
          <View style={{ alignItems: "center" }}><CampaignAuthBrand compact /></View>
          <View style={{ alignItems: "center", gap: 7, marginTop: 14, marginBottom: 18 }}>
            <Text accessibilityRole="header" style={{ color: colors.ink, fontFamily: fonts.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.5, textAlign: "center" }}>{isRegister ? "Create your account." : "Welcome back."}</Text>
            <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: "center", maxWidth: 300 }}>{isRegister ? "Create, back and follow campaigns.\nOne account for every kind of impact." : "Sign in to pick up your campaigns\nand the ideas you believe in."}</Text>
          </View>
          <View style={{ gap: 11 }}>
            {isRegister && <AuthField label="Your name" icon="person-outline" value={name} onChangeText={setName} placeholder="How should we call you?"
              autoComplete="name" textContentType="name" autoCapitalize="words" editable={!busy} maxLength={150} returnKeyType="next" onSubmitEditing={() => emailInput.current?.focus()} />}
            <AuthField inputRef={emailInput} label="Email" icon="mail-outline" value={email} onChangeText={setEmail} placeholder="you@example.com"
              keyboardType="email-address" autoComplete="email" textContentType="emailAddress" autoCapitalize="none" autoCorrect={false} editable={!busy} returnKeyType="next" onSubmitEditing={() => passwordInput.current?.focus()} />
            <AuthField inputRef={passwordInput} label="Password" icon="lock-closed-outline" value={password} onChangeText={setPassword}
              placeholder={isRegister ? "Choose your password" : "Enter your password"} secureTextEntry={!visiblePassword} editable={!busy} autoCapitalize="none" autoCorrect={false}
              autoComplete={isRegister ? "new-password" : "current-password"} textContentType={isRegister ? "newPassword" : "password"} returnKeyType="go"
              onSubmitEditing={() => { if (canSubmit) void submit(); }}
              trailing={<Pressable accessibilityRole="button" accessibilityLabel={visiblePassword ? "Hide password" : "Show password"} accessibilityState={{ checked: visiblePassword, disabled: busy }} disabled={busy} onPress={() => setVisiblePassword(!visiblePassword)}
                style={({ pressed }) => ({ width: 48, minHeight: 48, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.6 : 1 })}>
                <Ionicons name={visiblePassword ? "eye-off-outline" : "eye-outline"} size={21} color={colors.muted} />
              </Pressable>} />
            {isRegister && <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 17, paddingHorizontal: 3 }}>At least 8 characters. Use a password unique to Campaign.</Text>}
          </View>
          {!isRegister && <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 3 }}>
            <Pressable accessibilityRole="checkbox" accessibilityLabel="Remember me" accessibilityHint="Keeps you signed in on this device after closing the app." accessibilityState={{ checked: remember, disabled: busy }} disabled={busy} onPress={() => setRemember(!remember)}
              style={({ pressed }) => ({ minHeight: 48, flexDirection: "row", alignItems: "center", gap: 9, opacity: pressed || busy ? 0.65 : 1, paddingRight: 8 })}>
              <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: remember ? colors.green : colors.outline, backgroundColor: remember ? colors.green : "transparent", alignItems: "center", justifyContent: "center" }}>
                {remember && <Ionicons name="checkmark" size={15} color={colors.onPrimary} />}
              </View>
              <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 19 }}>Remember me</Text>
            </Pressable>
          </View>}
          {!!error && <View style={{ marginVertical: 10 }}><Notice tone="error">{error}</Notice></View>}
          <View style={{ marginTop: isRegister ? 16 : 5, gap: 9 }}>
            <AuthAction title={isRegister ? "Create account" : "Sign in"} loading={busy} disabled={!canSubmit} onPress={() => void submit()} />
            <ConnectionHint active={busy} />
            <AuthDivider />
            <Pressable accessibilityRole="button" disabled={busy} onPress={() => changeMode(isRegister ? "login" : "register")}
              style={({ pressed }) => ({ minHeight: 48, justifyContent: "center", opacity: pressed || busy ? 0.7 : 1, paddingVertical: 9 })}>
              <Text style={{ fontSize: 12, color: colors.muted, textAlign: "center", lineHeight: 20 }}>{isRegister ? "Already have an account? " : "New to Campaign? "}<Text style={{ color: colors.green, fontFamily: fonts.bold }}>{isRegister ? "Sign in" : "Create account"}</Text></Text>
            </Pressable>
            <AuthAction title="Continue as guest" variant="outline" disabled={busy} onPress={guest} />
          </View>
          {isRegister && <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: "center", marginTop: 15 }}>Contributions fund message distribution. Payments and advertising are simulated in this local prototype.</Text>}
        </>}
        {!!onHelp && <Pressable accessibilityRole="button" accessibilityLabel="Help, terms and privacy" disabled={busy} onPress={() => { Keyboard.dismiss(); onHelp(); }}
          style={({ pressed }) => ({ minHeight: 48, justifyContent: "center", alignItems: "center", marginTop: fontScale >= 1.3 ? 8 : 2, opacity: pressed || busy ? 0.65 : 1 })}>
          <Text style={{ color: colors.muted, fontSize: 10, lineHeight: 16 }}>Help, terms & privacy</Text>
        </Pressable>}
        {mode === "login" && <Text style={{ color: colors.muted, fontSize: 10, lineHeight: 16, textAlign: "center", alignSelf: "center", maxWidth: 300 }}>Password recovery is unavailable in this local prototype.</Text>}
      </View>
    </ScrollView>
  </AuthBackdrop>;
}
