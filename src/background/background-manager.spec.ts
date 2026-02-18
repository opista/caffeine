import browser from 'webextension-polyfill';

import { vi, describe, it, expect, beforeEach, Mocked } from 'vitest';
import { BackgroundManager } from './background-manager';
import { SessionManager } from './session-manager';
import { updateBadge } from './update-badge';
import { injectContentScript } from './inject-content-script';

vi.mock('./inject-content-script', () => ({
    injectContentScript: vi.fn(),
}));
vi.mock('./update-badge', () => ({
    updateBadge: vi.fn(),
}));
vi.mock('./session-manager');

const mockBrowser = vi.mocked(browser, true);
const mockInjectContentScript = vi.mocked(injectContentScript)

describe('BackgroundManager', () => {
    let manager: BackgroundManager;
    let mockSessionManager: Mocked<SessionManager>;
    
    const mockTabId = 123;
    const mockTab = { id: mockTabId } as browser.Tabs.Tab;
    const mockMessageSender = { tab: { id: mockTabId } } as browser.Runtime.MessageSender;
    const mockSendResponse = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockBrowser.tabs.query.mockResolvedValue([mockTab]);
        mockBrowser.tabs.sendMessage.mockResolvedValue(undefined);

        // Instantiate the mocked class - methods are automatically spied
        mockSessionManager = new SessionManager() as Mocked<SessionManager>;

        manager = new BackgroundManager(
            mockSessionManager
        );
    });

    describe('init', () => {
        it('should register listeners', () => {
            manager.init();
            expect(mockBrowser.runtime.onMessage.addListener).toHaveBeenCalled();
            expect(mockBrowser.tabs.onRemoved.addListener).toHaveBeenCalled();
            expect(mockBrowser.tabs.onUpdated.addListener).toHaveBeenCalled();
        });

        it('should not re-register listeners if already initialized', () => {
            manager.init();
            manager.init();
            expect(mockBrowser.runtime.onMessage.addListener).toHaveBeenCalledTimes(1);
            expect(mockBrowser.tabs.onRemoved.addListener).toHaveBeenCalledTimes(1);
            expect(mockBrowser.tabs.onUpdated.addListener).toHaveBeenCalledTimes(1);
        });
    });

    describe('Events', () => {
        beforeEach(() => {
            manager.init();
        });

        describe("handleMessage", () => {
        const sendMessage = async (message: any, sender: any = {}) => {
            const listener = mockBrowser.runtime.onMessage.addListener.mock.calls[0][0];
            return await listener(message, sender, mockSendResponse);
        };

        describe('STATUS_UPDATE', () => {
            it('should update session and badge on valid status', async () => {
                await sendMessage({ type: 'STATUS_UPDATE', status: 'active' }, mockMessageSender);
                
                expect(mockSessionManager.set).toHaveBeenCalledWith(mockTabId, 'active');
                expect(updateBadge).toHaveBeenCalledWith(mockTabId, 'active');
            });

            it('should remove session on inactive status', async () => {
                await sendMessage({ type: 'STATUS_UPDATE', status: 'inactive' }, mockMessageSender);

                expect(mockSessionManager.delete).toHaveBeenCalledWith(mockTabId);
                expect(updateBadge).toHaveBeenCalledWith(mockTabId, 'inactive');
            });
        });

        describe('GET_STATUS', () => {
            it('should return status of active tab', async () => {
                mockSessionManager.get.mockResolvedValue('active');
                const response = await sendMessage({ type: 'GET_STATUS' });
                
                expect(mockBrowser.tabs.query).toHaveBeenCalledWith({ active: true, currentWindow: true });
                expect(mockSessionManager.get).toHaveBeenCalledWith(mockTabId);
                expect(response).toEqual({ status: 'active' });
            });

            it('should return inactive if no tab exists', async () => {
                mockBrowser.tabs.query.mockResolvedValue([]);
                const response = await sendMessage({ type: 'GET_STATUS' });
                expect(response).toEqual({ status: 'inactive' });
            });
        });

        describe('TOGGLE_SESSION', () => {
            it('should activate session if currently inactive', async () => {
                mockSessionManager.get.mockResolvedValue('inactive');
                const response = await sendMessage({ type: 'TOGGLE_SESSION' });

                expect(mockInjectContentScript).toHaveBeenCalledWith(mockTabId);
                expect(response).toEqual({ status: 'pending' });
            });

            it('should deactivate session if currently active', async () => {
                mockSessionManager.get.mockResolvedValue('active');
                const response = await sendMessage({ type: 'TOGGLE_SESSION' });

                expect(mockBrowser.tabs.sendMessage).toHaveBeenCalledWith(mockTabId, { type: 'RELEASE_LOCK' });
                expect(response).toEqual({ status: 'pending' });
            });

            it('should handle deactivation error', async () => {
                mockSessionManager.get.mockResolvedValue('active');
                mockBrowser.tabs.sendMessage.mockRejectedValue(new Error('Failed'));
                
                await sendMessage({ type: 'TOGGLE_SESSION' });

                expect(mockSessionManager.delete).toHaveBeenCalledWith(mockTabId);
                expect(updateBadge).toHaveBeenCalledWith(mockTabId, 'inactive');
            });

            it('should handle activation error', async () => {
                vi.spyOn(console, 'error').mockImplementation(() => {});
                mockSessionManager.get.mockResolvedValue('inactive');
                vi.mocked(injectContentScript).mockRejectedValue(new Error('Injection failed'));

                const response = await sendMessage({ type: 'TOGGLE_SESSION' });

                expect(mockSessionManager.set).toHaveBeenCalledWith(mockTabId, 'error');
                expect(updateBadge).toHaveBeenCalledWith(mockTabId, 'error');
                expect(response.status).toBe('error');
            });

            it('should prevent concurrent toggles while processing', async () => {
                mockSessionManager.get.mockResolvedValue('inactive');
                
                let resolveInjection: (value: void) => void;
                const injectionPromise: any = new Promise<void>((resolve) => {
                    resolveInjection = resolve;
                });
                mockInjectContentScript.mockReturnValue(injectionPromise);

                const firstToggle = sendMessage({ type: 'TOGGLE_SESSION' });

                const secondToggleResponse = await sendMessage({ type: 'TOGGLE_SESSION' });

                expect(secondToggleResponse).toBeUndefined();
                expect(mockInjectContentScript).toHaveBeenCalledTimes(1);

                resolveInjection!(undefined);
                await firstToggle;

                await sendMessage({ type: 'TOGGLE_SESSION' });
                expect(mockInjectContentScript).toHaveBeenCalledTimes(2);
            });
        });
        })

        describe("handleTabUpdated", () => {

        it('should remove session and update badge on tab navigation when loading', async () => {
            const onUpdated = mockBrowser.tabs.onUpdated.addListener.mock.calls[0][0];
            await onUpdated(mockTabId, { status: 'loading' }, mockTab);
            
            expect(mockSessionManager.delete).toHaveBeenCalledWith(mockTabId);
            expect(updateBadge).toHaveBeenCalledWith(mockTabId, 'inactive');
        });

        it('should do nothing if tab isn\'t loading', async () => {
            const onUpdated = mockBrowser.tabs.onUpdated.addListener.mock.calls[0][0];
            await onUpdated(mockTabId, { status: 'complete' }, mockTab);
            
            expect(mockSessionManager.delete).not.toHaveBeenCalled();
            expect(updateBadge).not.toHaveBeenCalled();
        });
        })

        describe('handleTabRemoved', () => {
            it('should remove session on tab remove', async () => {
                const onRemoved = mockBrowser.tabs.onRemoved.addListener.mock.calls[0][0];
                await onRemoved(mockTabId, {} as browser.Tabs.OnRemovedRemoveInfoType);
                expect(mockSessionManager.delete).toHaveBeenCalledWith(mockTabId);
            });
        });

    });
});
