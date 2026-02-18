import browser from "webextension-polyfill";
import { LockStatus } from "../types";

export class SessionManager {
    async set(tabId: number, status: LockStatus): Promise<void> {
        await browser.storage.session.set({ [tabId.toString()]: status });
    }

    async get(tabId: number): Promise<LockStatus> {
        const key = tabId.toString();
        const result: Record<string, LockStatus> = await browser.storage.session.get(key);
        return result[key] || "inactive";
    }

    async delete(tabId: number): Promise<void> {
        await browser.storage.session.remove(tabId.toString());
    }

    async has(tabId: number): Promise<boolean> {
        const key = tabId.toString();
        const result: Record<string, LockStatus> = await browser.storage.session.get(key);
        return result[key] !== undefined;
    }
}