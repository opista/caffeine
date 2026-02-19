import browser from "webextension-polyfill";
import { LockStatus } from "../types";

export interface SessionState {
    status: LockStatus;
    error?: string;
}

export class SessionManager {
    async set(tabId: number, status: LockStatus, error?: string): Promise<void> {
        await browser.storage.session.set({ [tabId.toString()]: { status, error } });
    }

    async get(tabId: number): Promise<SessionState> {
        const key = tabId.toString();
        const result: Record<string, SessionState> = await browser.storage.session.get(key);
        const state = result[key] || { status: "inactive" };
        return state;
    }

    async delete(tabId: number): Promise<void> {
        await browser.storage.session.remove(tabId.toString());
    }

    async has(tabId: number): Promise<boolean> {
        const key = tabId.toString();
        const result: Record<string, SessionState> = await browser.storage.session.get(key);
        return result[key] !== undefined;
    }
}