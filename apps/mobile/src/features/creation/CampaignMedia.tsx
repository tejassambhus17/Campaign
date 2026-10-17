import React from "react";
import { View } from "react-native";
import { Picture, Text, useTheme } from "../../components/ui";
import type { Campaign } from "../../lib/types";
import { CreationButton, MediaThumb, UploadArea } from "./CreationUi";
import { IMAGE_UPLOAD_HINT } from "./media";

/** Explicit purpose-specific controls never substitute an ad for a cover. */
export function CampaignMediaSections({ draft, disabled, onUpload, onChange }: {
  draft: Campaign; disabled: boolean; onUpload: (purpose: "cover" | "advertising") => void; onChange: (patch: Partial<Campaign>) => void;
}) {
  const { colors } = useTheme();
  return <View style={{ gap: 18 }}>
    <View style={{ gap: 3 }}>
      <Text style={{ fontSize: 12, lineHeight: 18, color: colors.muted }}>Your cover introduces the campaign. Ad images promote it. Story images stay in Story.</Text>
      <Text style={{ fontSize: 11, lineHeight: 17, color: colors.muted }}>{IMAGE_UPLOAD_HINT} per upload</Text>
    </View>
    <View style={{ gap: 8 }}>
      <Text accessibilityRole="header" style={{ fontSize: 14, lineHeight: 20, fontWeight: "700", color: colors.ink }}>Campaign cover <Text style={{ fontSize: 12, lineHeight: 18, fontWeight: "400", color: colors.muted }}>· Optional</Text></Text>
      {draft.coverImage ? <>
        <View style={{ borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: colors.line }}><Picture uri={draft.coverImage} height={126} /></View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}><CreationButton title="Change cover" secondary disabled={disabled} onPress={() => onUpload("cover")} /></View>
          <View style={{ flex: 1 }}><CreationButton title="Remove cover" secondary disabled={disabled} onPress={() => onChange({ coverImage: "" })} /></View>
        </View>
      </> : <UploadArea compact title="Add campaign cover" onPress={() => onUpload("cover")} disabled={disabled} showLimits={false} />}
    </View>
    <View style={{ gap: 8 }}>
      <Text accessibilityRole="header" style={{ fontSize: 14, lineHeight: 20, fontWeight: "700", color: colors.ink }}>Advertising images</Text>
      {draft.adImages.some(Boolean) ? <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>{draft.adImages.map((url, index) => !!url && <View key={index} style={{ width: "47%" }}><MediaThumb uri={url} label={`Ad image ${index + 1}`} disabled={disabled} onRemove={() => onChange({ adImages: draft.adImages.filter((_, position) => position !== index) })} /></View>)}</View> : <Text style={{ fontSize: 12, lineHeight: 18, color: colors.muted }}>No ad image yet. Reviewers may request one before distribution.</Text>}
      <CreationButton title="Add ad image" secondary icon="add" disabled={disabled} onPress={() => onUpload("advertising")} />
    </View>
  </View>;
}
