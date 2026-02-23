import browser from 'webextension-polyfill';
import { getRootDomain } from '../../utils/get-root-domain';
import { DomainRuleset } from './types';
import { RuleState, RuleType } from '../../types';
import { createDefaultRuleset } from './utils/create-default-ruleset';

export class RuleManager {
    private readonly storageKey = 'rule';

    private domainKey(domain: string): string {
        return `${this.storageKey}:${domain}`;
    }

    private getDomainKeyFromUrl(url: string): string | null {
        const rootDomain = getRootDomain(url);
        if (!rootDomain) return null;
        return this.domainKey(rootDomain);
    }

    private async getRule(key: string): Promise<DomainRuleset | null> {
        const { [key]: ruleset } = await browser.storage.local.get(key);
        return ruleset;
    }

    private upsertRule(key: string, ruleset: DomainRuleset): Promise<void> {
        return browser.storage.local.set({ [key]: ruleset });
    }

    private deleteRule(key: string): Promise<void> {
        return browser.storage.local.remove(key);
    }

    async addPageRule(url: string): Promise<void> {
        const key = this.getDomainKeyFromUrl(url);
        if (!key) return;

        const ruleset = await this.getRule(key) || createDefaultRuleset();
            
        if (!ruleset.pages.includes(url)) {
            ruleset.pages.push(url);
        }
        
        await this.upsertRule(key, ruleset);
    }

    async addDomainRule(url: string): Promise<void> {
        const key = this.getDomainKeyFromUrl(url);
        if (!key) return;

        const ruleset = await this.getRule(key) || createDefaultRuleset();
        
        await this.upsertRule(key, {
            ...ruleset,
            isDomainWide: true
        });
    }

    async removePageRule(url: string): Promise<void> {
        const key = this.getDomainKeyFromUrl(url);
        if (!key) return;

        const ruleset = await this.getRule(key);
        if (!ruleset) return;

        const filteredPages = ruleset.pages.filter(p => p !== url);

        if (!ruleset.isDomainWide && filteredPages.length === 0) {
            await this.deleteRule(key);
        } else {
            await this.upsertRule(key, { ...ruleset, pages: filteredPages });
        }
    }

    async removeDomainRule(url: string): Promise<void> {
        const key = this.getDomainKeyFromUrl(url);
        if (!key) return;
        const ruleset = await this.getRule(key);
        if (!ruleset) return;
        
        if (ruleset.pages.length === 0) {
            await this.deleteRule(key);
        } else {
            await this.upsertRule(key, { ...ruleset, isDomainWide: false });
        }
    }

    async addRule(type: RuleType, url: string): Promise<void> {
        if (type === 'page') {
            await this.addPageRule(url);
        } else {
            await this.addDomainRule(url);
        }
    }

    async removeRule(type: RuleType, url: string): Promise<void> {
        if (type === 'page') {
            await this.removePageRule(url);
        } else {
            await this.removeDomainRule(url);
        }
    }

    async getRuleState(url: string): Promise<RuleState | null> {
        if (!url.startsWith('http')) return null;
        
        const key = this.getDomainKeyFromUrl(url);
        if (!key) return null;
        
        const ruleset = await this.getRule(key);
        if (!ruleset) return null;
        
        const rootDomain = getRootDomain(url);
        const hasPageRule = ruleset.pages.includes(url);
        const hasDomainRule = ruleset.isDomainWide;
        
        if (!hasPageRule && !hasDomainRule) return null;
        
        return { hasPageRule, hasDomainRule, rootDomain: rootDomain! };
    }
}
