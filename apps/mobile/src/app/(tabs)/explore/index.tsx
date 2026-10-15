import { discoverCampaigns } from "../../../lib/discovery";
import { useMemo, useState } from "react";
import { ScrollView, Switch, View } from "react-native";
import {
  Text,
  Button,
  colors,
  PageHeader,
  Empty,
  ErrorState,
  Field,
  Loading,
  Pill,
  Screen,
  styles,
} from "../../../components/ui";
import { categories } from "../../../lib/types";
import { useCampaigns, useConfig } from "../../../lib/session";
import { CampaignCard } from "../../../features/campaign";
export default function Explore() {
  const q = useCampaigns();
  const config = useConfig();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Featured");
  const [sortOpen, setSortOpen] = useState(false);
  const [funding, setFunding] = useState(false);
  const filtered = useMemo(
    () => discoverCampaigns(q.data || [], { search, category, sort, funding }),
    [q.data, search, category, sort, funding],
  );
  return (
    <Screen>
      <PageHeader title="Explore" />
      <Field
        label="Search campaigns"
        placeholder="A topic, a message, a creator…"
        value={search}
        onChangeText={setSearch}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {["All", ...categories].map((c) => (
            <Pill
              key={c}
              title={c}
              selected={category === c}
              onPress={() => setCategory(c)}
            />
          ))}
        </View>
      </ScrollView>
      <View
        style={{
          gap: 8,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderColor: colors.line,
        }}
      >
        <View
          style={{
            ...styles.row,
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Button
            title={`Sort: ${sort}`}
            icon={sortOpen ? "chevron-up" : "chevron-down"}
            variant="ghost"
            onPress={() => setSortOpen(!sortOpen)}
            style={{ paddingHorizontal: 0 }}
          />
          <View style={{ ...styles.row, minHeight: 48, gap: 6 }}>
            <Text style={{ ...styles.muted, fontSize: 12 }}>
              Open for backing
            </Text>
            <Switch
              accessibilityLabel="Open for backing only"
              value={funding}
              onValueChange={setFunding}
              trackColor={{ false: colors.outline, true: colors.green }}
              thumbColor={colors.paper}
              style={{ minWidth: 48, minHeight: 48 }}
            />
          </View>
        </View>
        {sortOpen && (
          <View style={{ ...styles.row, flexWrap: "wrap" }}>
            {["Featured", "Newest", "Most funded", "Closest to goal"].map(
              (s) => (
                <Pill
                  key={s}
                  title={s}
                  selected={sort === s}
                  onPress={() => {
                    setSort(s);
                    setSortOpen(false);
                  }}
                />
              ),
            )}
          </View>
        )}
      </View>
      {q.isPending ? (
        <Loading />
      ) : q.isError ? (
        <ErrorState error={q.error} retry={() => q.refetch()} />
      ) : (
        <>
          <Text style={styles.muted}>
            {filtered.length} {filtered.length === 1 ? "campaign" : "campaigns"}{" "}
            · demonstration data
          </Text>
          {filtered.length ? (
            filtered.map((c) => (
              <CampaignCard key={c.id} campaign={c} config={config.data} />
            ))
          ) : (
            <Empty
              title={
                q.data?.length ? "No matching messages yet" : "No campaigns yet"
              }
              body="Try another search or remove a filter to discover more ideas."
              action={
                <Button
                  title="Clear search & filters"
                  variant="secondary"
                  onPress={() => {
                    setSearch("");
                    setCategory("All");
                    setFunding(false);
                  }}
                />
              }
            />
          )}
        </>
      )}
    </Screen>
  );
}
