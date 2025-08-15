import { template } from "lodash-es";
import pLimit from "p-limit";
import {
  DEFAULT_RELEASE_DESCRIPTION_TEMPLATE,
  DEFAULT_VERSION_TEMPLATE,
  type GenerateNotesContext,
  type PluginConfig,
} from "./types.js";
import { readPackage } from "read-pkg";
import { escapeRegExp } from "./util.js";
import {
  createClient,
  editIssueFixVersions,
  createOrUpdateVersion,
  saveReleaseNotes,
} from "./jira-connection.js";

export function getTickets(
  config: PluginConfig,
  context: GenerateNotesContext,
): string[] {
  const projectId = config.projectId || context.env.JIRA_PROJECT_ID;
  const pattern: RegExp = new RegExp(
    `\\b${escapeRegExp(projectId)}-(\\d+)\\b`,
    "giu",
  );

  const tickets = new Set<string>();
  if (config.branch && config.disableBranchFiltering !== true) {
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
  for (const commit of context.commits) {
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

  return [...tickets];
}

export async function success(
  config: PluginConfig,
  context: GenerateNotesContext,
): Promise<void> {
  // Get the tickets from the branch and commits
  const tickets = getTickets(config, context);
  context.logger.info(`Found ticket ${tickets.join(", ")}`);

  // Get the package name from the package.json
  const pack = await readPackage({ cwd: context.cwd });
  const name = pack.name || "";

  const versionTemplate = template(
    config.releaseNameTemplate ?? DEFAULT_VERSION_TEMPLATE,
  );
  const newVersionName = versionTemplate({
    version: context.nextRelease.version,
    name: name,
  });

  const descriptionTemplate = template(
    config.releaseDescriptionTemplate ?? DEFAULT_RELEASE_DESCRIPTION_TEMPLATE,
  );
  const newVersionDescription = descriptionTemplate({
    version: context.nextRelease.version,
    notes: context.nextRelease.notes,
    name: name,
  });

  context.logger.info(`Using jira release '${newVersionName}'`);

  const jiraClient = createClient(config, context);
  const projectFound = await jiraClient.projects.getProject(
    config.projectId || context.env.JIRA_PROJECT_ID,
  );
  const releasedVersion = await createOrUpdateVersion(
    config,
    context,
    jiraClient,
    projectFound.id,
    newVersionName,
    newVersionDescription,
  );

  if (config.addReleaseNotes !== false && releasedVersion.id) {
    await saveReleaseNotes(config, context, releasedVersion.id);
  }

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
