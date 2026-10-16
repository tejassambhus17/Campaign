import React, { createContext, useContext, useRef } from "react";
import { TextInput, View } from "react-native";
import { Field, Text, useTheme } from "../../components/ui";
import { DraftIssue } from "./readiness";

type TargetContext = {
  issue: DraftIssue | null;
  register: (key: string, view: View | null, input?: TextInput | null, announcement?: View | null) => void;
};
export const CreationTargets = createContext<TargetContext>({ issue: null, register: () => {} });

export function TargetGroup({ target, children }: { target: string; children: React.ReactNode }) {
  const { issue, register } = useContext(CreationTargets);
  const { colors, styles } = useTheme();
  const anchor = useRef<View>(null);
  const announcement = useRef<View>(null);
  return (
    <View ref={(node) => { anchor.current = node; register(target, node, null, announcement.current); }} onLayout={() => register(target, anchor.current, null, announcement.current)} style={{ gap: 10 }}>
      {issue?.field === target && <View accessible accessibilityLabel={`${issue.title}. ${issue.message}`} accessibilityLiveRegion="polite" ref={(node) => { announcement.current = node; register(target, anchor.current, null, node); }}><Text style={[styles.body, { color: colors.green }]}>{issue.message}</Text></View>}
      {children}
    </View>
  );
}

export function TargetField({ target, ...props }: React.ComponentProps<typeof Field> & { target: string }) {
  const { issue, register } = useContext(CreationTargets);
  const { colors, styles } = useTheme();
  const anchor = useRef<View>(null);
  const input = useRef<TextInput>(null);
  return (
    <View ref={(node) => { anchor.current = node; register(target, node, input.current); }} onLayout={() => register(target, anchor.current, input.current)} style={{ gap: 7 }}>
      {issue?.field === target && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.body, { color: colors.green }]}>{issue.message}</Text>}
      <Field {...props} inputRef={(node) => { input.current = node; register(target, anchor.current, node); }} />
    </View>
  );
}
