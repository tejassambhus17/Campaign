import { View } from "react-native";
import { router } from "expo-router";
import { fonts, IconButton, Text, useTheme } from "../../components/ui";

export function returnToCampaign(id: string) {
  if (router.canGoBack()) router.back();
  else router.replace(`/explore/${encodeURIComponent(id)}`);
}
export function PageHeading({ title, id, onBack, action }: { title: string; id: string; onBack?: () => void; action?: React.ReactNode }) {
  const { colors } = useTheme();
  return <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginLeft: -9 }}>
    <IconButton label={`Back from ${title}`} icon="arrow-back" onPress={onBack || (() => returnToCampaign(id))} />
    <Text accessibilityRole="header" style={{ flex: 1, fontFamily: fonts.bold, fontSize: 20, lineHeight: 27, color: colors.ink }}>{title}</Text>
    {action}
  </View>;
}
