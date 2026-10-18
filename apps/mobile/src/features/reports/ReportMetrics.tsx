import { useWindowDimensions, View } from "react-native";
import { fonts, Text, useTheme } from "../../components/ui";
import { ReportDocument } from "../../lib/report";
import { reportSummary } from "./summary";

export function ReportMetrics({ document }: { document: ReportDocument }) {
  const { colors } = useTheme(), { fontScale } = useWindowDimensions();
  return <View style={{ gap: 7 }}>
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {reportSummary(document).map(row => <View key={row.key} accessible accessibilityLabel={`${row.label}: ${row.value}. ${row.definition}${row.canonical ? ` ${row.canonical}` : ""}`} style={{ flex: 1, flexBasis: document.currency.currency === "INR" ? 142 : fontScale > 1.15 ? 126 : 90, minWidth: 80, backgroundColor: colors.paper, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 13, alignItems: "center", gap: 4 }}>
        <Text style={{ fontFamily: fonts.bold, fontSize: 18, lineHeight: 25, color: colors.ink, fontVariant: ["tabular-nums"], textAlign: "center" }}>{row.value}</Text>
        <Text style={{ fontSize: 11, lineHeight: 17, color: colors.muted, textAlign: "center" }}>{row.label}</Text>
      </View>)}
    </View>
    <Text style={{ fontSize: 11, lineHeight: 17, color: colors.muted }}>Simulated payments and delivery. Estimates are not measured results.</Text>
  </View>;
}
