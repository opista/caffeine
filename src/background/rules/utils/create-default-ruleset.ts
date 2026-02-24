import { DomainRuleset } from "../types";

export const createDefaultRuleset = (): DomainRuleset => ({
  createdAt: Date.now(),
  isDomainWide: false,
  pages: [],
});
