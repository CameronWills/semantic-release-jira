import type { Signale } from "signale";

export interface PluginContext {
  cwd: string;
  env: {
    [k: string]: string;
  };
  logger: Signale;
  options: BaseConfig;
  stderr: typeof process.stderr;
  stdout: typeof process.stdout;
}

export interface Person {
  name: string;
  email: string;
  date: Date;
}

export interface Commit {
  author: Person;
  committer: Person;
  commitDate: Date;
  body: string;
  hash: string;
  message: string;
  subject: string;
  commit: {
    long: string;
    short: string;
  };
}

export interface PreviousRelease {
  gitHead: string;
  gitTag: string;
  version: string;
}

export interface UpcomingRelease extends PreviousRelease {
  notes: string;
  type: string;
}

export interface GenerateNotesContext extends PluginContext {
  commits: Commit[];
  lastRelease: PreviousRelease;
  nextRelease: UpcomingRelease;
}

export interface BaseConfig {
  $0: string;
  branch: string;
  debug: boolean;
  dryRun: boolean;
}

export interface PluginConfig extends BaseConfig {
  /**
   * The domain of a jira instance ie: `your-company.atlassian.net`
   */
  jiraHost?: string;

  /**
   * The id or key for the project releases will be created in
   */
  projectId?: string;

  /**
   * A lodash template with a `version` variable, and a `name` variable taken from the package.json
   * defaults to `${name} v${version}` which results in a version that is named like `my-package v1.0.0`
   *
   * @default `${name} v${version}`
   */
  releaseNameTemplate?: string;

  /**
   * A lodash template for the release.description field
   *
   * template variables:
   *    version: the sem-ver version ex.: 1.2.3
   *       name: The package name from package.json
   *      notes: The full release notes: This may be very large
   *             Only use it if you have very small releases
   *
   * @default `Automated release with semantic-release-jira`
   */
  releaseDescriptionTemplate?: string;

  /**
   * The number of maximum parallel network calls, default 10
   *
   * @default 10
   */
  networkConcurrency?: number;

  /**
   * indicates if a new release created in jira should be set as released
   */
  released?: boolean;
  /**
   * include the release date when creating a release in jira
   *
   * @default false
   */
  setReleaseDate?: boolean;
  /**
   * set the start date to today when creating a release in jira
   *
   * @default false
   */
  setStartDate?: boolean;
  /**
   * ignore ticket numbers in the branch name
   *
   * @default false
   */
  disableBranchFiltering?: boolean;
  /**
   * Indicates if the new release should be added to existing fix versions
   * in jira tickets
   *
   * @default true
   */
  appendFixVersion?: boolean;
  /**
   * indicates if pre-existing jira release should be updated with a
   * start date, release date and released status
   *
   * @default true
   */

  updateExistingRelease?: boolean;
  /**
   * Indicates whether to add release notes into the rich-text body of the Jira release.
   * This is updated through a separate GraphQL call to Jira, requires the
   * `JIRA_CLOUD_ID` and `JIRA_ACTIVATION_ID` environment variables to be set.
   *
   * @default true when `JIRA_CLOUD_ID` and `JIRA_ACTIVATION_ID` environment variables are set,
   * otherwise false.
   */
  addReleaseNotes?: boolean;

  /**
   * Generates the release notes, replacing any Jira issue keys with links.
   * Replaces the need to have @semantic-release/release-notes-generator in plugins.
   *
   * @default false
   */
  generateReleaseNotes?: boolean;

  /**
   * The regex pattern to match Jira issue keys found in release notes, and replace them with links.
   *
   * @default `[a-zA-Z][a-zA-Z0-9_]+-\d+`
   */
  releaseNotesIssueRegex?: string;
}
