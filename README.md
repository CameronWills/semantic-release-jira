# @cameronwills/semantic-release-jira

A plugin to [**semantic-release**](https://github.com/semantic-release/semantic-release) to publish a new Jira 'release', and find Jira issue from the commits messages and add them to the new release on Jira.

[![npm latest version](https://img.shields.io/npm/v/@cameronwills/semantic-release-jira/latest.svg)](https://www.npmjs.com/package/@cameronwills/semantic-release-jira)


| Step               | Actions                                                                    |
|--------------------|----------------------------------------------------------------------------|
| `verifyConditions` | Validate the plugin config options and environment variables               |
| `success`          | Find all tickets from commits and add them to a new release on Jira        |

## Install

```bash
$ npm install --save-dev @cameronwills/semantic-release-jira
$ yarn add --dev @cameronwills/semantic-release-jira
```

## Configuration

### Environment variables

| Variable          | Description                                                    |
| ----------------- | -------------------------------------------------------------- |
| `JIRA_AUTH`       | **Required.** The token used to authenticate with GitHub.      |
| `JIRA_PROJECT_ID` | The Jira project key                                           |
| `JIRA_HOST      ` | The domain of your jira instance                               |


### Plugin config

The plugin should be added to your config
```json
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/git",
    ["@cameronwills/semantic-release-jira", {
      "projectId": "UH",
      "releaseNameTemplate": "${name} v${version}",
      "jiraHost": "https://your-company.atlassian.net",
      "released": true,
      "setReleaseDate": true
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
   * Also used to search for matching tickets to be updated.
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
   * indicates if a new release created in jira should be set as released
   * 
   * @default false
   */
  released?: boolean;
  /**
   * set the release date to today's date when creating a release in jira
   * 
   * @default false
   */
  setReleaseDate?: boolean;
  /**
   * set the start date to today's date when creating a release in jira
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
   * indicates if the new release should be appended to the 'Fix Versions'
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
}
```

### What is searched for the ticket prefix?

We search commit bodies for a commit number and we look at the branch name as well. This means that a branch named `TEST-345-anything` with a commit `feat: thing \n TEST-123` will add a release named after the new version and link both `TEST-123` and `TEST-345` to it. This is done as a lot of the github/gitlab integrations support the branch naming to match to tickets so we want to broadly reproduce these features to reduce developer cognitive overload. Can be disabled via `disableBranchFiltering`.
