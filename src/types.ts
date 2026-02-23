export type LockStatus = "active" | "inactive" | "error" | "pending";

export type RuleType = "page" | "domain";

export interface RuleState {
  hasPageRule: boolean;
  hasDomainRule: boolean;
  rootDomain: string;
}

export type ExtensionMessage =
  | { type: "TOGGLE_SESSION" }
  | { type: "GET_STATUS" }
  | { type: "STATUS_UPDATE"; status: LockStatus; error?: string }
  | { type: "GET_PLATFORM_INFO" }
  | { type: "ACQUIRE_LOCK" }
  | { type: "RELEASE_LOCK" }
  | { type: "ADD_RULE"; ruleType: RuleType; url: string }
  | { type: "REMOVE_RULE"; ruleType: RuleType; url: string }
  | { type: "GET_RULE_FOR_TAB" }
  | { type: "GET_PERMISSION_FOR_TAB" };

export interface RuleForTabResponse {
  ruleState: RuleState | null;
}

export interface MessageResponses {
  TOGGLE_SESSION: { status: LockStatus; error?: string };
  GET_STATUS: { status: LockStatus; error?: string };
  STATUS_UPDATE: void;
  GET_PLATFORM_INFO: { os: string | null };
  ACQUIRE_LOCK: void;
  RELEASE_LOCK: void;
  ADD_RULE: void;
  REMOVE_RULE: void;
  GET_RULE_FOR_TAB: RuleForTabResponse | null;
  GET_PERMISSION_FOR_TAB: boolean | null;
}
