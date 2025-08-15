import { generateNotes as generateReleaseNotes } from "@semantic-release/release-notes-generator";
import type { PluginConfig, PluginContext } from "./types.js";
import { DEFAULT_JIRA_ISSUE_KEY_REGEX } from "./constants.js";

export async function generateNotes(
  config: PluginConfig,
  context: PluginContext,
): Promise<string> {
  if (config.generateReleaseNotes === false) {
    return "";
  }

  const notes = await generateReleaseNotes(config, context);
  if (!notes) {
    return "";
  }

  const issueRegex = `(${config.releaseNotesIssueRegex || DEFAULT_JIRA_ISSUE_KEY_REGEX})`;

  return notes.replace(
    new RegExp(issueRegex, "g"),
    `[$1](${context.env.JIRA_HOST}/browse/$1)`,
  );
}
