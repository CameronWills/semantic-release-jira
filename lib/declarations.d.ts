declare module "@semantic-release/release-notes-generator" {
  export function generateNotes(
    config: PluginConfig,
    context: PluginContext,
  ): Promise<string>;
}
