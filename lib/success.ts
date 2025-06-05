import * as _ from "lodash";
import pLimit from "p-limit";
import { createClient } from "./jira";
import {
  DEFAULT_RELEASE_DESCRIPTION_TEMPLATE,
  DEFAULT_VERSION_TEMPLATE,
  type GenerateNotesContext,
  type PluginConfig,
} from "./types";
import { escapeRegExp } from "./util";
import { editIssueFixVersions, createOrUpdateVersion } from "./jira-connection";

export function getTickets(
  config: PluginConfig,
  context: GenerateNotesContext,
): string[] {
  let patterns: RegExp[] = [];

  if (config.ticketRegex !== undefined) {
    patterns = [new RegExp(config.ticketRegex, "giu")];
  } else {
    patterns = config.ticketPrefixes?.map(
      (prefix) => new RegExp(`\\b${escapeRegExp(prefix)}-(\\d+)\\b`, "giu"),
    ) as RegExp[];
  }

  const tickets = new Set<string>();
  if (config.branch && config.disableBranchFiltering !== true) {
    for (const pattern of patterns) {
      const branchMatches = config.branch.match(pattern);
      if (branchMatches) {
        for (const match of branchMatches) {
          tickets.add(match);
          context.logger.info(
            `Found ticket ${match} in branch: ${config.branch}`,
          );
        }
      }
    }
  }
  for (const commit of context.commits) {
    for (const pattern of patterns) {
      const matches = commit.message.match(pattern);
      if (matches) {
        for (const match of matches) {
          tickets.add(match);
          context.logger.info(
            `Found ticket ${matches} in commit: ${commit.commit.short}`,
          );
        }
      }
    }
  }

  return [...tickets];
}

export async function success(
  config: PluginConfig,
  context: GenerateNotesContext,
): Promise<void> {
  const tickets = getTickets(config, context);

  context.logger.info(`Found ticket ${tickets.join(", ")}`);

  const versionTemplate = _.template(
    config.releaseNameTemplate ?? DEFAULT_VERSION_TEMPLATE,
  );
  const newVersionName = versionTemplate({
    version: context.nextRelease.version,
  });

  const descriptionTemplate = _.template(
    config.releaseDescriptionTemplate ?? DEFAULT_RELEASE_DESCRIPTION_TEMPLATE,
  );
  const newVersionDescription = descriptionTemplate({
    version: context.nextRelease.version,
    notes: context.nextRelease.notes,
  });

  context.logger.info(`Using jira release '${newVersionName}'`);

  const jiraClient = createClient(config, context);
  const projectFound = await jiraClient.projects.getProject(config.projectId || context.env.JIRA_PROJECT_ID);
  const releasedVersion = await createOrUpdateVersion(
    config,
    context,
    jiraClient,
    projectFound.id,
    newVersionName,
    newVersionDescription,
  );
  const concurrentLimit = pLimit(config.networkConcurrency || 10);

  const editsModern = tickets.map((issueKey) =>
    concurrentLimit(() =>
      editIssueFixVersions(
        config,
        context,
        jiraClient,
        releasedVersion,
        issueKey,
      ),
    ),
  );

  await Promise.all(editsModern);
}
