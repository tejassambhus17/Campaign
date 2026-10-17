import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { Providers } from "../lib/session";
import { useTheme } from "../components/ui";
import { ThemeProvider } from "../lib/theme";
import { CurrencyProvider, useCurrency } from "../lib/CurrencyProvider";

if (Platform.OS !== "web") void SplashScreen.preventAutoHideAsync().catch(() => undefined);

function AppContent() {
  const { colors, scheme, ready } = useTheme();
  const { ready: currencyReady } = useCurrency();
  const [loaded, error] = useFonts({
    ...Ionicons.font,
    ManropeRegular: require("../../assets/fonts/Manrope-Regular.ttf"),
    ManropeMedium: require("../../assets/fonts/Manrope-Medium.ttf"),
    ManropeSemiBold: require("../../assets/fonts/Manrope-SemiBold.ttf"),
    ManropeBold: require("../../assets/fonts/Manrope-Bold.ttf"),
    NewsreaderMedium: require("../../assets/fonts/Newsreader-Medium.ttf"),
    NewsreaderSemiBold: require("../../assets/fonts/Newsreader-SemiBold.ttf"),
  });
  useEffect(() => {
    if (ready && currencyReady && (loaded || error)) void SplashScreen.hideAsync().catch(() => undefined);
  }, [ready, currencyReady, loaded, error]);
  if (!ready || !currencyReady || (!loaded && !error))
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator
          color={colors.green}
          accessibilityLabel="Loading Campaign"
        />
      </View>
    );
  return (
    <Providers>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
    </Providers>
  );
}

export default function RootLayout() {
  return <ThemeProvider><CurrencyProvider><AppContent /></CurrencyProvider></ThemeProvider>;
}
