import { Accordion, Picture, Text, useTheme } from "../../components/ui";
import { useCurrency } from "../../lib/CurrencyProvider";
import { AssessmentWorkspace } from "../../lib/assessments";
import { AdPreview, StoryPreview } from "../creation/Preview";

/** The authorized workspace's exact snapshot; never substitute the public query cache. */
export function AssessmentSnapshot({ workspace }: { workspace: AssessmentWorkspace }) {
  const { styles } = useTheme();
  const { money } = useCurrency();
  const content = workspace.content;
  return <Accordion title={`Inspect exact ${workspace.target === "working" ? "working" : "published"} content · version ${workspace.assessedVersion}`}>
    <Text style={styles.muted}>This snapshot is the content bound to the assessment. Working content is visible here only to authorized reviewers.</Text>
    <Text style={styles.h2}>{content.title}</Text>
    <Text style={styles.body}>{content.category} · {content.creatorName}</Text>
    <Text style={styles.body}>{content.summary}</Text>
    {!!content.coverImage && <Picture uri={content.coverImage} height={180} />}
    <StoryPreview draft={content} campaignHeader={content} />
    <Text style={styles.h2}>Audience & goal in this version</Text>
    <Text style={styles.body}>{content.geography || "Location not selected"}{"\n"}{content.interests || "No audience interests supplied"}{"\n"}{content.durationDays} days · {money(content.goal)} goal</Text>
    {content.channels.map(channel => <Text key={channel} style={styles.body}>{channel} · {content.allocation[channel] ?? "Not set"}%</Text>)}
    <Text style={styles.h2}>Advertising in this version</Text>
    <Text style={styles.body}>{content.adHeadline}{"\n"}{content.adDescription}{"\n"}Call to action: {content.cta}</Text>
    {content.adImages.map((image, index) => <AdPreview key={`${index}:${image}`} draft={{ ...content, adImages: [image] }} placement={content.channels[0] || "Selected channel"} />)}
    {!content.adImages.length && <Text style={styles.muted}>No advertising images supplied.</Text>}
    <Text style={styles.muted}>Content reference: {workspace.contentHash}</Text>
  </Accordion>;
}
