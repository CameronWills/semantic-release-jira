# @cameronwills/semantic-release-jira

[**semantic-release**](https://github.com/semantic-release/semantic-release) plugin to publish a jira release.

[![npm latest version](https://img.shields.io/npm/v/@cameronwills/semantic-release-jira/latest.svg)](https://www.npmjs.com/package/@cameronwills/semantic-release-jira)


| Step               | Description                                                                                                                                   |
|--------------------|----------------------------------------------------------------------------|
| `verifyConditions` | Validate the config options and environment variables                      |
| `sucess`           | Find all tickets from commits and add them to a new release on JIRA        |

## Install

```bash
$ npm install --save-dev @cameronwills/semantic-release-jira
$ yarn add --dev @cameronwills/semantic-release-jira
```

## Configuration

### Environment variables

| Variable          | Description                                                         |
| ----------------- | ------------------------------------------------------------------- |
| `JIRA_AUTH`       | **Required.** The token used to authenticate with GitHub.           |
| `JIRA_PROJECT_ID` | The Jira project ID / Key                                           |

The plugin should be added to your config
```json
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/git",
    ["@cameronwills/semantic-release-jira", {
      "projectId": "UH",
      "releaseNameTemplate": "Test v${version}",
      "jiraHost": "your-company.atlassian.net",
      "ticketPrefixes": [ "TEST", "UH"],
      "ticketRegex": "[a-zA-Z]{3,5}-\\d{3,5}"
    }]
  ]
}

Please note that `ticketRegex` cannot be used together with `ticketPrefixes`.
```
```typescript
export interface Config {
  /**
   * A domain of a jira instance ie: `your-company.atlassian.net`
   */
  jiraHost: string;

  /**
   * A list of prefixes to match when looking for tickets in commits. Cannot be used together with ticketRegex.
   *
   * ie. ['TEST'] would match `TEST-123` and `TEST-456`
   */
  ticketPrefixes?: string[];

  /**
   * A unescaped regex to match tickets in commits (without slashes). Cannot be used together with ticketPrefixes.
   *
   * ie. [a-zA-Z]{4}-\d{3,5} would match any ticket with 3 letters a dash and 3 to 5 numbers, such as `TEST-456`, `TEST-5643` and `TEST-56432`
   */
  ticketRegex?: string;

  /**
   * The id or key for the project releases will be created in. This overrides `JIRA_PROJECT_ID` environment variable when set.
   */
  projectId?: string;

  /**
   * A lodash template with a single `version` variable
   * defaults to `v${version}` which results in a version that is named like `v1.0.0`
   * ex: `Semantic Release v${version}` results in `Semantic Release v1.0.0`
   *
   * @default `v${version}`
   */
  releaseNameTemplate?: string;

  /**
   * A lodash template for the release.description field
   *
   * template variables:
   *    version: the sem-ver version ex.: 1.2.3
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
