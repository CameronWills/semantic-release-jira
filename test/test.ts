import { getTickets } from "../lib/success";
import { pluginConfig, context } from "./fakedata";
import type { PluginConfig } from "../lib/types";

describe("Success tests", () => {
  describe("#getTickets", () => {
    it("should analyze tickets with one ticketPrefix", () => {
      const config = {
        ...pluginConfig,
        projectId: "UH",
      } as PluginConfig;
      expect(getTickets(config, context)).toEqual(["UH-1258"]);
    });

    it("should get multiple tickets on the same commit", () => {
      const config = {
        ...pluginConfig,
        projectId: "TEST",
      } as PluginConfig;
      expect(getTickets(config, context)).toEqual([
        "TEST-345",
        "TEST-123",
        "TEST-234",
      ]);
    });

    it("should get multiple tickets on the same commit, ignoring branch instance", () => {
      const config = {
        ...pluginConfig,
        projectId: "TEST",
        disableBranchFiltering: true,
      } as PluginConfig;
      expect(getTickets(config, context)).toEqual(["TEST-123", "TEST-234"]);
    });
  });
});
