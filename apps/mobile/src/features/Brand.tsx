import { Image, View } from "react-native";
import { fonts, Text, useTheme } from "../components/ui";

const artwork = require("../../assets/brand/campaign-logo.png");
const iconArtwork = require("../../assets/brand/campaign-megaphone-transparent.png");

export function CampaignAuthBrand({ horizontal = false, compact = false }: { horizontal?: boolean; compact?: boolean }) {
  const { colors } = useTheme();
  const iconSize = horizontal ? 70 : compact ? 60 : 76;
  return <View accessible accessibilityRole="image" accessibilityLabel="Campaign. Ideas. People. Real Impact."
    style={{ flexDirection: horizontal ? "row" : "column", alignItems: "center", gap: horizontal ? 13 : compact ? 5 : 7 }}>
    <Image source={iconArtwork} resizeMode="contain" accessible={false} accessibilityIgnoresInvertColors style={{ width: iconSize, height: iconSize }} />
    <View style={{ alignItems: horizontal ? "flex-start" : "center", gap: 4 }}>
      <Text allowFontScaling={false} style={{ color: colors.ink, fontFamily: fonts.bold, fontSize: horizontal ? 31 : compact ? 25 : 28, lineHeight: horizontal ? 37 : compact ? 30 : 34, letterSpacing: -1 }}>Campaign</Text>
      <Text allowFontScaling={false} style={{ color: colors.muted, fontSize: 7, lineHeight: 10, letterSpacing: 1.05 }}>IDEAS. PEOPLE. REAL IMPACT.</Text>
    </View>
  </View>;
}

/** User-supplied complete artwork; preserve its image, wordmark and tagline. */
export function CampaignBrand({ size = 264 }: { size?: number }) {
  return <View style={{ width: size, maxWidth: "100%", aspectRatio: 1 }}>
    <Image
      source={artwork}
      accessibilityRole="image"
      accessibilityLabel="Campaign. Ideas. People. Real Impact."
      accessibilityIgnoresInvertColors
      resizeMode="contain"
      style={{ width: "100%", height: "100%" }}
    />
  </View>;
}
