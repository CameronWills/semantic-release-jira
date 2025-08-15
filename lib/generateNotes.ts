import { generateNotes as generateReleaseNotes } from "@semantic-release/release-notes-generator";
import type { PluginConfig, PluginContext } from "./types.js";

export async function generateNotes(
  config: PluginConfig,
  context: PluginContext,
): Promise<string> {
  const notes = await generateReleaseNotes(config, context);

  const issueRegex = `(${config.releaseNotesIssueRegex || "([a-zA-Z][a-zA-Z0-9_]+-\\d+)"})`;

  return notes?.replace(
    new RegExp(issueRegex, "g"),
    `[$1](${context.env.JIRA_HOST}/browse/$1)`,
  );
}
