import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { ActivityIndicator, View } from "react-native";
import { Providers } from "../lib/session";
import { colors } from "../components/ui";
export default function RootLayout() {
  const [loaded, error] = useFonts({
    ManropeRegular: require("../../assets/fonts/Manrope-Regular.ttf"),
    ManropeMedium: require("../../assets/fonts/Manrope-Medium.ttf"),
    ManropeSemiBold: require("../../assets/fonts/Manrope-SemiBold.ttf"),
    ManropeBold: require("../../assets/fonts/Manrope-Bold.ttf"),
    NewsreaderMedium: require("../../assets/fonts/Newsreader-Medium.ttf"),
    NewsreaderSemiBold: require("../../assets/fonts/Newsreader-SemiBold.ttf"),
  });
  if (!loaded && !error)
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
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </Providers>
  );
}
