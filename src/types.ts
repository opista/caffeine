export type MessageType = "TOGGLE_SESSION" | "GET_STATUS" | "ACQUIRE_LOCK" | "RELEASE_LOCK" | "STATUS_UPDATE" | "GET_PLATFORM_INFO";

export type LockStatus = "active" | "inactive" | "error" | "pending";

export interface ExtensionMessage {
  type: MessageType;
  tabId?: number;
  status: LockStatus;
  error?: string;
}
