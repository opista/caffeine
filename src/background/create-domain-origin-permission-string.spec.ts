import { describe, it, expect } from 'vitest';
import { createDomainOriginPermissionString } from './create-domain-origin-permission-string';

describe('createDomainOriginPermissionString', () => {
    it('should return the correct permission string for a given root domain', () => {
        expect(createDomainOriginPermissionString('google.com')).toBe('*://*.google.com/*');
        expect(createDomainOriginPermissionString('example.org')).toBe('*://*.example.org/*');
        expect(createDomainOriginPermissionString('localhost')).toBe('*://*.localhost/*');
    });
});
