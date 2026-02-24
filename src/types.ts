export type LockStatus = "active" | "inactive" | "error" | "pending";

export type RuleType = "page" | "domain";

export enum ErrorCode {
  PERMISSION_REQUIRED = "PERMISSION_REQUIRED",
  NOT_SECURE = "NOT_SECURE",
  NOT_SUPPORTED = "NOT_SUPPORTED",
  SYSTEM_BLOCKED = "SYSTEM_BLOCKED",
  UNKNOWN = "UNKNOWN",
}

export interface RuleState {
  hasPageRule: boolean;
  hasDomainRule: boolean;
  rootDomain: string;
}

export enum MessageType {
  TOGGLE_SESSION = "TOGGLE_SESSION",
  GET_STATUS = "GET_STATUS",
  STATUS_UPDATE = "STATUS_UPDATE",
  GET_PLATFORM_INFO = "GET_PLATFORM_INFO",
  ACQUIRE_LOCK = "ACQUIRE_LOCK",
  RELEASE_LOCK = "RELEASE_LOCK",
  ADD_RULE = "ADD_RULE",
  REMOVE_RULE = "REMOVE_RULE",
  GET_RULE_FOR_TAB = "GET_RULE_FOR_TAB",
  GET_PERMISSION_FOR_TAB = "GET_PERMISSION_FOR_TAB",
}

export type ExtensionMessage =
  | { type: MessageType.TOGGLE_SESSION }
  | { type: MessageType.GET_STATUS }
  | { type: MessageType.STATUS_UPDATE; status: LockStatus; error?: ErrorCode | string }
  | { type: MessageType.GET_PLATFORM_INFO }
  | { type: MessageType.ACQUIRE_LOCK }
  | { type: MessageType.RELEASE_LOCK }
  | { type: MessageType.ADD_RULE; ruleType: RuleType; url: string }
  | { type: MessageType.REMOVE_RULE; ruleType: RuleType; url: string }
  | { type: MessageType.GET_RULE_FOR_TAB }
  | { type: MessageType.GET_PERMISSION_FOR_TAB };

export interface RuleForTabResponse {
  ruleState: RuleState | null;
}

export interface MessageResponses {
  [MessageType.TOGGLE_SESSION]: { status: LockStatus; error?: ErrorCode | string };
  [MessageType.GET_STATUS]: { status: LockStatus; error?: ErrorCode | string };
  [MessageType.STATUS_UPDATE]: void;
  [MessageType.GET_PLATFORM_INFO]: { os: string | null };
  [MessageType.ACQUIRE_LOCK]: void;
  [MessageType.RELEASE_LOCK]: void;
  [MessageType.ADD_RULE]: void;
  [MessageType.REMOVE_RULE]: void;
  [MessageType.GET_RULE_FOR_TAB]: RuleForTabResponse | null;
  [MessageType.GET_PERMISSION_FOR_TAB]: boolean | null;
}
