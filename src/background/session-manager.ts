import { LockStatus } from "../types";

export class SessionManager {
    private sessions = new Map<number, LockStatus>();

    set(tabId: number, status: LockStatus) {
        this.sessions.set(tabId, status);
    }

    get(tabId: number) {
        return this.sessions.get(tabId) || "inactive";
    }

    delete(tabId: number) {
        this.sessions.delete(tabId);
    }

    has(tabId: number) {
        return this.sessions.has(tabId);
    }
}
