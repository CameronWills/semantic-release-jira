import SemanticReleaseError from "@semantic-release/error";
import { createClient } from "./jira-connection.js";
import type { PluginConfig, PluginContext } from "./types.js";

export async function verifyConditions(
  config: PluginConfig,
  context: PluginContext,
): Promise<void> {
  const { networkConcurrency } = config;

  if (typeof config.jiraHost !== "string" && !context.env.JIRA_HOST) {
    throw new SemanticReleaseError(
      "config.jiraHost must be a string or JIRA_HOST environment variable must be set",
    );
  }
  if (typeof config.projectId !== "string" && !context.env.JIRA_PROJECT_ID) {
    throw new SemanticReleaseError(
      "config.projectId must be a string or JIRA_PROJECT_ID environment variable must be set",
    );
  }

  if (config.releaseNameTemplate) {
    if (
      typeof config.releaseNameTemplate !== "string" ||
      config.releaseNameTemplate?.indexOf("${version}") === -1
    ) {
      throw new SemanticReleaseError(
        "config.releaseNameTemplate must be a string containing ${version}",
      );
    }
  }

  if (
    config.releaseDescriptionTemplate !== null &&
    config.releaseDescriptionTemplate !== undefined
  ) {
    if (typeof config.releaseDescriptionTemplate !== "string") {
      throw new SemanticReleaseError(
        "config.releaseDescriptionTemplate must be a string",
      );
    }
  }

  if (
    networkConcurrency &&
    (typeof networkConcurrency !== "number" || networkConcurrency < 1)
  ) {
    throw new SemanticReleaseError(
      "config.networkConcurrency must be an number greater than 0",
    );
  }

  if (!context.env.JIRA_AUTH) {
    throw new SemanticReleaseError("JIRA_AUTH must be an environment variable");
  }

  const auth = atob(context.env.JIRA_AUTH).split(":");
  if (!auth || auth.length !== 2) {
    throw new Error(
      "JIRA_AUTH value invalid. It should be in base64 format 'email:apiToken'.",
    );
  }

  const jira = createClient(config, context);
  await jira.projects.getProject({
    projectIdOrKey: config.projectId || context.env.JIRA_PROJECT_ID,
  });
}
