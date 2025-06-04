import { Version3Client } from "jira.js";
import type { PluginConfig, PluginContext } from "./types";

export function createClient(
  config: PluginConfig,
  context: PluginContext,
): Version3Client {
  const auth = atob(context.env.JIRA_AUTH).split(":");

  return new Version3Client({
    host: config.jiraHost,
    authentication: {
      basic: {
        email: auth[0] || "",
        apiToken: auth[1] || "",
      },
    },
  });
}
