import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, fonts } from "../../components/ui";
import { useActivity } from "../../lib/session";
const icons: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = {
  index: "home-outline",
  explore: "compass-outline",
  create: "add-circle-outline",
  activity: "notifications-outline",
  profile: "person-circle-outline",
};
export default function TabLayout() {
  const activity = useActivity();
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 8);
  const unread = activity.data?.filter((item) => !item.read).length || 0;
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.paper,
          borderTopColor: colors.line,
          height: 60 + bottom,
          paddingTop: 5,
          paddingBottom: bottom,
        },
        tabBarLabelStyle: { fontSize: 10, fontFamily: fonts.semibold },
        tabBarIcon: ({ color, focused }) => (
          <View
            style={{
              width: 48,
              height: 28,
              borderRadius: 14,
              backgroundColor: focused ? colors.mint : "transparent",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name={icons[route.name] || "ellipse-outline"}
              size={22}
              color={color}
            />
          </View>
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="explore" options={{ title: "Explore" }} />
      <Tabs.Screen name="create" options={{ title: "Create" }} />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarBadge: unread ? (unread > 99 ? "99+" : unread) : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.green, color: "white" },
          tabBarAccessibilityLabel: unread
            ? `Activity, ${unread} unread updates`
            : "Activity",
        }}
      />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
