import { find } from "lodash";
import { Version2Models, type Version3Client } from "jira.js";
import type { PluginConfig, GenerateNotesContext } from "./types";
import type { Fields, FixVersion, Version } from "jira.js/out/version3/models";
import type {
  EditIssue,
  UpdateVersion,
  CreateVersion,
} from "jira.js/out/version3/parameters";

export async function createOrUpdateVersion(
  config: PluginConfig,
  context: GenerateNotesContext,
  jira: Version3Client,
  projectIdOrKey: string,
  name: string,
  description: string,
): Promise<Version> {
  const remoteProject = await jira.projects.getProject(projectIdOrKey);
  context.logger.info(`Looking for release with name '${name}'`);
  const existing = find(remoteProject.versions, { name });
  context.logger.info(
    existing
      ? `Found existing release '${existing.id}'`
      : "No existing release found, creating new",
  );

  if (config.dryRun) {
    context.logger.info("dry-run: making a fake release");
    return {
      name,
      id: "dry_run_id",
    };
  }

  let newVersion: Version;
  // If not updating existing releases, return the found version
  if (existing) {
    if (config.updateExistingRelease === false) return existing;

    newVersion = {
      id: existing.id,
      projectId: existing.projectId,
    };
  } else {
    newVersion = {
      name,
      projectId: Number.parseInt(remoteProject.id, 10),
      description: description || "",
    };
  }

  // Set properties for the version based on the config
  const now = new Date().toISOString();
  if (config.setReleaseDate && !existing?.releaseDate) {
    newVersion.releaseDate = now;
  }
  if (config.setStartDate && !existing?.startDate) {
    newVersion.startDate = now;
  }
  if (config.released && !existing?.released) {
    newVersion.released = true;
  }

  // Update or create the version in Jira
  let savedVersion: Version = {};
  const action = existing ? "update" : "create";
  try {
    if (existing) {
      savedVersion = await jira.projectVersions.updateVersion(
        newVersion as UpdateVersion,
      );
    } else {
      savedVersion = await jira.projectVersions.createVersion(
        newVersion as CreateVersion,
      );
    }
    context.logger.info(
      `Successfully ${action}d release: '${savedVersion.id}'`,
    );
  } catch (error) {
    context.logger.info(
      `Error: failed to ${action} release: '${newVersion.name || existing?.name}'`,
    );
    throw new Error(`Failure to ${action} release: ${error}`);
  }

  return savedVersion;
}

export async function editIssueFixVersions(
  config: PluginConfig,
  context: GenerateNotesContext,
  jira: Version3Client,
  newVersion: Version,
  issueKey: string,
): Promise<void> {
  try {
    context.logger.info(`Adding issue ${issueKey} to '${newVersion.name}'`);
    if (!config.dryRun) {
      const fixFieldUpdate: FixVersion = {
        id: newVersion.id || "",
        name: newVersion.name || "",
        self: newVersion.self || "",
        description: newVersion.description || "",
        archived: newVersion.archived || false,
        released: newVersion.released || false,
      };
      const issueUpdate: EditIssue = {
        issueIdOrKey: issueKey,
      };

      // Append fix version if configured to do so, otherwise replace it
      if (config.appendFixVersion === false) {
        issueUpdate.fields = {
          fixVersions: [fixFieldUpdate],
        };
      } else {
        issueUpdate.update = {
          fixVersions: [{ add: fixFieldUpdate }],
        };
      }

      await jira.issues.editIssue(issueUpdate);
    }
  } catch (err) {
    context.logger.warn(`Unable to update issue ${issueKey} error: ${err}`);
  }
}
