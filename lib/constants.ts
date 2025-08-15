export const DEFAULT_VERSION_TEMPLATE = "${name} v${version}";
export const DEFAULT_RELEASE_DESCRIPTION_TEMPLATE = "Automated release with semantic-release-jira";
export const DEFAULT_JIRA_ISSUE_KEY_REGEX = "[a-zA-Z][a-zA-Z0-9_]+-\\d+";

export const JIRA_GRAPHQL_ENDPOINT = "https://api.atlassian.com/graphql";
export const JIRA_VERSION_ARI_TEMPLATE = "ari:cloud:jira:${cloudId}:version/activation/${activationId}/${versionId}";
