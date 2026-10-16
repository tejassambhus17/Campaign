import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme, fonts } from "../../components/ui";
import { useActivity, useSession } from "../../lib/session";
import { UnreadBadge } from "../../components/UnreadBadge";
const icons: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = {
  index: "home-outline",
  explore: "search-outline",
  create: "create-outline",
  activity: "notifications-outline",
  profile: "person-outline",
};
const activeIcons: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = {
  index: "home", explore: "search", create: "create", activity: "notifications", profile: "person",
};
export default function TabLayout() {
  const { colors } = useTheme();
  const activity = useActivity();
  const { user } = useSession();
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 8);
  const unread = activity.data?.filter((item) => !item.read).length || 0;
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          display: route.name === "profile" && !user ? "none" : "flex",
          backgroundColor: colors.paper,
          borderTopColor: colors.line,
          height: 56 + bottom,
          paddingTop: 5,
          paddingBottom: bottom,
        },
        tabBarItemStyle: { minHeight: 48 },
        tabBarLabelStyle: { fontSize: 9, fontFamily: fonts.semibold },
        tabBarIcon: ({ color, focused }) => (
          <View
            style={{
              width: 48,
              height: 25,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name={(focused ? activeIcons[route.name] : icons[route.name]) || "ellipse-outline"}
              size={20}
              color={color}
            />
            {route.name === "activity" && <UnreadBadge count={unread} style={{ position: "absolute", right: 3, top: -3 }} />}
          </View>
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarAccessibilityLabel: "Home" }} />
      <Tabs.Screen name="explore" options={{ title: "Explore", tabBarAccessibilityLabel: "Explore" }} />
      <Tabs.Screen name="create" options={{ title: "Create", tabBarAccessibilityLabel: "Create" }} />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarAccessibilityLabel: unread
            ? `Activity, ${unread} unread updates`
            : "Activity",
        }}
      />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarAccessibilityLabel: "Profile" }} />
    </Tabs>
  );
}
