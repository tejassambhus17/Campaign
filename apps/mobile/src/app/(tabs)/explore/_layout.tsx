import { Stack } from "expo-router";
import { useTheme } from "../../../components/ui";
export default function ExploreLayout() {
  const { colors } = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />;
}
