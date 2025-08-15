# @cameronwills/semantic-release-jira

A plugin to [**semantic-release**](https://github.com/semantic-release/semantic-release) to publish a new release version in Jira, adding any Jira issues (work items) that were found in commit messages, to this new Jira release version. Plugin can also add the generated release notes into the rich-text body of the Jira release, including links to the Jira issues.

[![npm latest version](https://img.shields.io/npm/v/@cameronwills/semantic-release-jira/latest.svg)](https://www.npmjs.com/package/@cameronwills/semantic-release-jira)


| Step               | Actions                                                                    |
|--------------------|----------------------------------------------------------------------------|
| `verifyConditions` | Validate the plugin config options and environment variables               |
| `generateNotes`    | Optionally generates release notes as markdown with links to Jira issues   |
| `success`          | Find all tickets from commits and add them to a new release on Jira        |

## Install

```bash
$ npm install --save-dev @cameronwills/semantic-release-jira
$ yarn add --dev @cameronwills/semantic-release-jira
```

## Configuration

### Environment variables

| Variable             | Description                                                    |
| -------------------- | -------------------------------------------------------------- |
| `JIRA_AUTH`          | **Required.** The token used to authenticate with GitHub.      |
| `JIRA_PROJECT_ID`    | The Jira project key                                           |
| `JIRA_HOST`          | The domain of your jira instance                               |
| `JIRA_CLOUD_ID`      | The ID for your specific Atlassian domain (GUID). Optional.    |
| `JIRA_ACTIVATION_ID` | Jira Activation ID for the Jira instance (GUID). Optional.     |


### Plugin config

The plugin should be added to your config
```json
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/git",
    ["@cameronwills/semantic-release-jira", {
      "projectId": "UH",
      "releaseNameTemplate": "${name} v${version}",
      "jiraHost": "https://your-company.atlassian.net",
      "released": true,
      "setReleaseDate": true,
      "generateReleaseNotes": true
    }]
  ]
}

```
```typescript
export interface Config {
  /**
   * The domain of a jira instance ie: `your-company.atlassian.net`
   * This overrides `JIRA_HOST` environment variable when set.
   */
  jiraHost?: string;

  /**
   * The project key for the project that the releases will be created in. 
   * Also used to search for matching Jira issues in commit messages that will be added to the release.
   * This overrides `JIRA_PROJECT_ID` environment variable when set.
   */
  projectId?: string;

  /**
   * A lodash template with a `version` variable. And a `name` variable taken from the package.json
   * defaults to `${name} v${version}` which results in a version that is named like `my-package v1.0.0`
   *
   * @default `v${version}`
   */
  releaseNameTemplate?: string;

  /**
   * A lodash template for the release.description field
   *
   * template variables:
   *    version: the sem-ver version ex.: 1.2.3
   *       name: The name from package.json
   *      notes: The full release notes: This may be very large
   *             Only use it if you have very small releases
   *
   * @default `Automated release with semantic-release-jira-releases-modern`
   */
  releaseDescriptionTemplate?: string;

  /**
   * The number of maximum parallel network calls, default 10
   * 
   * @default 10
   */
  networkConcurrency?: number;

  /**
   * Indicates if a new release created in jira should be set as 'released' status
   * 
   * @default false
   */
  released?: boolean;

  /**
   * Set the release date to today's date when creating a release in Jira
   * 
   * @default false
   */
  setReleaseDate?: boolean;

  /**
   * Set the start date to today's date when creating a release in jira
   * 
   * @default false
   */
  setStartDate?: boolean;

  /**
   * Ignore ticket numbers in the branch name
   * 
   * @default false
   */
  disableBranchFiltering?: boolean;

  /**
   * Indicates if the new release should be appended to the 'Fix Versions'
   * in jira tickets, or replace them
   * 
   * @default true
   */
  appendFixVersion?: boolean;

  /**
   * indicates if a pre-existing jira release should be updated with a 
   * start date, release date and released status
   * 
   * @default true
   */
  updateExistingRelease?: boolean;

  /**
   * Indicates whether to add release notes into the rich-text body of the Jira release.
   * This is updated through a separate GraphQL API call to Jira, and requires the
   * `JIRA_CLOUD_ID` and `JIRA_ACTIVATION_ID` environment variables to be set.
   *
   * @default true when `JIRA_CLOUD_ID` and `JIRA_ACTIVATION_ID` environment variables are set, otherwise false.
   */
  addReleaseNotes?: boolean;

  /**
   * Whether plugin should handle generating the release notes, replacing Jira issue keys with links.
   * Use in place of the @semantic-release/release-notes-generator plugin.
   * 
   * @default false
   */
  generateReleaseNotes?: boolean;

  /**
   * The regex pattern used to match Jira issue keys in the generated release notes.
   *
   * @default `[a-zA-Z][a-zA-Z0-9_]+-\d+`
   */
  releaseNotesIssueRegex?: string;
}
```

### What is searched for the ticket prefix?

We search commit bodies for a commit number and we look at the branch name as well. This means that a branch named `TEST-345-anything` with a commit `feat: thing \n TEST-123` will add a release named after the new version and link both `TEST-123` and `TEST-345` to it. This is done as a lot of the github/gitlab integrations support the branch naming to match to tickets so we want to broadly reproduce these features to reduce developer cognitive overload. Can be disabled via `disableBranchFiltering`.
