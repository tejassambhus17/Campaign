import { View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Text,
  Button,
  colors,
  Empty,
  ErrorState,
  Loading,
  Screen,
  styles,
  fonts,
} from "../../components/ui";
import { useCampaigns, useConfig } from "../../lib/session";
import { estimate, number } from "../../lib/types";
import { CampaignCard } from "../../features/campaign";
export default function Home() {
  const campaigns = useCampaigns();
  const config = useConfig();
  const stories = campaigns.data || [];
  const featured =
    stories.find((c) => c.featured && c.coverImage) ||
    stories.find((c) => c.coverImage) ||
    stories[0];
  const feed = stories.filter((c) => c.id !== featured?.id).slice(0, 3);
  return (
    <Screen>
      <View
        style={{
          ...styles.row,
          justifyContent: "space-between",
          minHeight: 40,
        }}
      >
        <View style={{ ...styles.row, gap: 7 }}>
          <Ionicons name="megaphone" size={23} color={colors.green} />
          <Text
            style={{
              fontFamily: fonts.bold,
              fontSize: 23,
              letterSpacing: -0.8,
              color: colors.ink,
            }}
          >
            campaign
          </Text>
        </View>
        <Text style={{ ...styles.muted, fontSize: 11 }}>
          Community-funded reach
        </Text>
      </View>
      <View style={{ gap: 12, paddingTop: 8 }}>
        <Text
          accessibilityRole="header"
          style={{
            fontFamily: fonts.editorialStrong,
            fontSize: 34,
            lineHeight: 36,
            letterSpacing: -0.6,
            color: colors.ink,
          }}
        >
          Good messages.{"\n"}A wider audience.
        </Text>
        <Text style={styles.body}>
          Back the advertising that takes a message beyond its creator’s
          network.
        </Text>
        <View style={{ ...styles.row, gap: 8 }}>
          <Button
            title="Explore campaigns"
            icon="arrow-forward"
            style={{ flex: 1 }}
            onPress={() => router.push("/explore")}
          />
          <Button
            title="Create"
            icon="add"
            variant="secondary"
            onPress={() => router.push("/create")}
          />
        </View>
        <Text style={{ ...styles.muted, fontSize: 13, lineHeight: 20 }}>
          $1 could reach about {number(estimate(1, config.data))} people after
          the {Math.round((config.data?.feeRate ?? 0.05) * 100)}% demo fee.
          Estimate only; results vary.
        </Text>
      </View>
      {campaigns.isPending ? (
        <Loading />
      ) : campaigns.isError ? (
        <ErrorState error={campaigns.error} retry={() => campaigns.refetch()} />
      ) : featured ? (
        <View style={{ gap: 12 }}>
          <View style={{ ...styles.row, justifyContent: "space-between" }}>
            <Text style={styles.h2}>In focus</Text>
            <Text style={{ ...styles.muted, fontSize: 12 }}>
              Featured story · demo
            </Text>
          </View>
          <CampaignCard campaign={featured} config={config.data} />
        </View>
      ) : (
        <Empty
          title="No campaigns published yet"
          body="Create a draft or return soon to explore new messages."
          action={
            <Button
              title="Start a campaign"
              onPress={() => router.push("/create")}
            />
          }
        />
      )}
      <View
        style={{
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: colors.line,
          paddingVertical: 16,
          gap: 5,
        }}
      >
        <Text style={styles.muted}>
          Contributions fund advertising, not direct donations. The platform
          reviews each message before it opens for backing.
        </Text>
      </View>
      {!!feed.length && (
        <View style={{ gap: 16 }}>
          <Text style={styles.h2}>More to discover</Text>
          {feed.map((c) => (
            <CampaignCard
              key={c.id}
              campaign={c}
              config={config.data}
              compact
            />
          ))}
        </View>
      )}
      <Button
        title="See all campaigns"
        variant="secondary"
        onPress={() => router.push("/explore")}
      />
      <View style={{ gap: 16, paddingTop: 4 }}>
        <Text style={styles.h2}>Create. Review. Amplify.</Text>
        {[
          [
            "create-outline",
            "Create",
            "Write the story, add sources and choose an audience.",
          ],
          [
            "checkmark-done-outline",
            "Review",
            "The platform reviews the message and prepares distribution.",
          ],
          [
            "radio-outline",
            "Amplify",
            "Backers pool an advertising budget. Follow progress and the final report.",
          ],
        ].map(([icon, title, body]) => (
          <View key={title} style={{ flexDirection: "row", gap: 14 }}>
            <Ionicons
              name={icon as "create-outline"}
              size={23}
              color={colors.green}
            />
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={{ ...styles.body, fontWeight: "700" }}>{title}</Text>
              <Text style={styles.muted}>{body}</Text>
            </View>
          </View>
        ))}
      </View>
      <Text style={{ ...styles.muted, fontSize: 12 }}>
        Local prototype. Campaign data, payments and distribution results are
        simulated.
      </Text>
    </Screen>
  );
}
