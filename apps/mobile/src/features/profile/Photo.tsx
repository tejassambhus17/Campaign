import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, ActivityIndicator, Image, Platform, Pressable, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { api, captureApiSession, getApiUrl } from "../../lib/api";
import { queryClient } from "../../lib/session";
import { Me, User } from "../../lib/types";
import { Button, fonts, Notice, Text, useTheme } from "../../components/ui";

type PrivatePhoto = { version: string | null; dataUri: string | null };
const photoKey = (user: User, server = getApiUrl()) => ["profile-photo", server, user.id, user.avatarVersion || null];

function usePrivatePhoto(user: User) {
  return useQuery({
    queryKey: photoKey(user),
    queryFn: () => api<PrivatePhoto>("/me/avatar"),
    enabled: !!user.avatarVersion,
    staleTime: 60_000,
  });
}

export function ProfilePhoto({ user, size = 76 }: { user: User; size?: number }) {
  const { colors } = useTheme();
  const photo = usePrivatePhoto(user);
  const [failed, setFailed] = useState(false);
  const uri = photo.data && photo.data.version === user.avatarVersion ? photo.data.dataUri : null;
  useEffect(() => setFailed(false), [uri, user.id]);
  const initials = user.name.trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0).toUpperCase()).join("") || "?";
  return <View accessible={false} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.mint, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, overflow: "hidden" }}>
    {uri && !failed ? <Image key={`${user.id}:${user.avatarVersion}`} source={{ uri }} resizeMode="cover" onError={() => setFailed(true)} accessible={false} style={{ width: size, height: size }} />
      : <Text style={{ fontFamily: fonts.bold, color: colors.green, fontSize: size / 3 }}>{initials}</Text>}
    {user.avatarVersion && photo.isFetching && !uri ? <ActivityIndicator color={colors.green} style={{ position: "absolute", bottom: 6 }} size="small" /> : null}
  </View>;
}

export function ProfilePhotoEditor({ user }: { user: User }) {
  const { colors, styles } = useTheme();
  const photo = usePrivatePhoto(user);
  const [stage, setStage] = useState<"choosing" | "saving" | "removing" | null>(null);
  const [notice, setNotice] = useState("");
  const [failed, setFailed] = useState(false);
  const mounted = useRef(true);
  const locked = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  async function finish(next: PrivatePhoto, message: string, current: () => boolean, server: string) {
    if (!current()) return;
    const updated = { ...user, avatarVersion: next.version };
    // Scope every cache write to the original account/server and populate the
    // new version before exposing it. No image is persisted in device storage.
    queryClient.setQueryData(photoKey(updated, server), next);
    queryClient.setQueryData<Me>(["me", user.id], previous => previous?.user.id === user.id
      ? { ...previous, user: { ...previous.user, avatarVersion: next.version } } : previous);
    void queryClient.invalidateQueries({ queryKey: ["me", user.id] });
    if (mounted.current && current()) {
      setNotice(message);
      AccessibilityInfo.announceForAccessibility(message);
    }
  }

  async function choose() {
    if (locked.current) return;
    locked.current = true;
    const current = captureApiSession();
    const server = getApiUrl();
    setStage("choosing"); setNotice(""); setFailed(false);
    try {
      // The system photo picker grants access only to the user's selection;
      // no camera or broad photo-library permission is requested.
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.9, exif: false });
      if (result.canceled || !current() || !mounted.current) return;
      const asset = result.assets[0];
      if (!asset) return;
      const mime = asset.mimeType || (asset.fileName?.toLowerCase().endsWith(".png") ? "image/png" : asset.fileName?.toLowerCase().endsWith(".webp") ? "image/webp" : "image/jpeg");
      if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) throw new Error("Choose a JPEG, PNG or WebP photo. HEIC, GIF and video are not supported.");
      if (asset.fileSize && asset.fileSize > 8 * 1024 * 1024) throw new Error("This photo is larger than 8 MB. Choose a smaller photo and try again.");
      const form = new FormData();
      if (Platform.OS === "web") {
        const file = asset.file || await (await fetch(asset.uri)).blob();
        form.append("file", file, asset.fileName || "profile-photo.jpg");
      } else form.append("file", { uri: asset.uri, name: asset.fileName || "profile-photo.jpg", type: mime } as unknown as Blob);
      if (!current() || !mounted.current) return;
      setStage("saving");
      const next = await api<PrivatePhoto>("/me/avatar", { method: "POST", form });
      await finish(next, "Profile photo saved.", current, server);
    } catch (error) {
      if (mounted.current && current()) { setFailed(true); setNotice(error instanceof Error ? error.message : "Your photo could not be saved. Please try again."); }
    } finally {
      locked.current = false;
      if (mounted.current && current()) setStage(null);
    }
  }

  async function remove() {
    if (locked.current) return;
    locked.current = true;
    const current = captureApiSession();
    const server = getApiUrl();
    setStage("removing"); setNotice(""); setFailed(false);
    try {
      const next = await api<PrivatePhoto>("/me/avatar", { method: "DELETE" });
      await finish(next, "Profile photo removed. Your initials are shown instead.", current, server);
    } catch (error) {
      if (mounted.current && current()) { setFailed(true); setNotice(error instanceof Error ? error.message : "Your photo could not be removed. Please try again."); }
    } finally {
      locked.current = false;
      if (mounted.current && current()) setStage(null);
    }
  }

  return <View style={{ gap: 12 }}>
    <View style={{ alignItems: "center", gap: 12, paddingVertical: 6 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={user.avatarVersion ? "Change profile photo" : "Add profile photo"} accessibilityState={{ disabled: !!stage }} disabled={!!stage} onPress={() => { void choose(); }} style={({ pressed }) => ({ padding: 4, opacity: pressed ? 0.75 : 1 })}>
        <ProfilePhoto user={user} size={96} />
        <View pointerEvents="none" style={{ position: "absolute", right: 2, bottom: 2, width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: colors.green, borderWidth: 2, borderColor: colors.bg }}><Ionicons name="camera-outline" size={17} color={colors.onPrimary} /></View>
      </Pressable>
      <Text style={[styles.muted, { textAlign: "center", fontSize: 13, lineHeight: 20 }]}>Your profile photo is private to your account.</Text>
    </View>
    <Button title={stage === "choosing" ? "Choosing photo…" : stage === "saving" ? "Saving photo…" : user.avatarVersion ? "Change photo" : "Choose photo"} icon="image-outline" variant="secondary" loading={stage === "choosing" || stage === "saving"} disabled={!!stage} onPress={() => { void choose(); }} />
    {!!user.avatarVersion && <Button title={stage === "removing" ? "Removing photo…" : "Remove photo"} variant="ghost" loading={stage === "removing"} disabled={!!stage} onPress={() => { void remove(); }} />}
    <Text style={[styles.muted, { fontSize: 12, lineHeight: 19 }]}>JPEG, PNG or WebP · Up to 8 MB. Photo changes save immediately.</Text>
    {!!notice && <Notice tone={failed ? "error" : "success"}>{notice}</Notice>}
    {photo.isError && !stage && !notice && <><Notice tone="error">Your photo could not be loaded. Your initials are shown for now.</Notice><Button title="Retry photo" variant="ghost" onPress={() => { void photo.refetch(); }} /></>}
  </View>;
}
