export type MessageType = "TOGGLE_SESSION" | "GET_STATUS" | "ACQUIRE_LOCK" | "RELEASE_LOCK" | "STATUS_UPDATE";

export type LockStatus = "active" | "inactive" | "error";

export interface ExtensionMessage {
  type: MessageType;
  tabId?: number;
  status: LockStatus;
  error?: string;
}
