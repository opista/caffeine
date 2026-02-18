import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from './session-manager';

describe('SessionManager', () => {
    let sessionManager: SessionManager;

    beforeEach(() => {
        sessionManager = new SessionManager();
    });

    describe('set', () => {
        it('should store session status', () => {
            sessionManager.set(1, 'active');
            expect(sessionManager.get(1)).toBe('active');
        });

        it('should update existing session', () => {
            sessionManager.set(1, 'active');
            sessionManager.set(1, 'inactive');
            expect(sessionManager.get(1)).toBe('inactive');
        });
    });

    describe('get', () => {
        it('should return "inactive" for unknown session', () => {
            expect(sessionManager.get(999)).toBe('inactive');
        });

        it('should return stored status', () => {
            sessionManager.set(1, 'active');
            expect(sessionManager.get(1)).toBe('active');
        });
    });

    describe('delete', () => {
        it('should delete session', () => {
            sessionManager.set(1, 'active');
            sessionManager.delete(1);
            expect(sessionManager.get(1)).toBe('inactive');
            expect(sessionManager.has(1)).toBe(false);
        });

        it('should handle deleting non-existent session', () => {
            expect(() => sessionManager.delete(999)).not.toThrow();
        });
    });

    describe('has', () => {
        it('should check if session exists', () => {
            sessionManager.set(1, 'active');
            expect(sessionManager.has(1)).toBe(true);
            expect(sessionManager.has(999)).toBe(false);
        });
    });
});
