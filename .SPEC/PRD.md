# Product Requirements Document: Keep Awake (Firefox)

**Version:** 1.1 (Final Corrected)

**Target Platform:** Firefox for Android & Desktop

**Status:** Approved for Development

## 1. Executive Summary

A lightweight, privacy-focused browser extension that prevents the device display from sleeping on user-specified websites. The extension is designed with a "mobile-first" mindset for Firefox on Android, leveraging the modern `Screen Wake Lock API` and a "Hybrid" permission model to offer both ease of use and granular privacy control without battery drain.

## 2. User Experience & Flows

### 2.1 The Three Wake Modes

The extension popup presents three distinct options to the user:

| Mode            | Scope                               | Persistence          | Lifecycle / Behavior                                                                                                       |
| --------------- | ----------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Session**     | **Tab Lifecycle**                   | **None (In-Memory)** | Active only while the specific page DOM is alive. Clears on **Reload**, **Navigation**, or **Tab Close**. No storage used. |
| **Page Rule**   | Specific URL (`example.com/recipe`) | Permanent            | Saved to `browser.storage`. Auto-activates on exact URL match.                                                             |
| **Domain Rule** | Entire Domain (`*.example.com`)     | Permanent            | Saved to `browser.storage`. Auto-activates on any page within the domain.                                                  |

### 2.2 The "Hybrid" Permission Strategy

To avoid "permission fatigue" and invasive install warnings, the extension uses a two-tier model:

1. **Default (Strict):** No global permissions requested at install.

- _Action:_ When a user creates a "Page" or "Domain" rule, the browser prompts for permission for **that specific site only**.

2. **Optional (Global):** A setting in the extension options allows the user to "Enable for All Websites."

- _Action:_ Requests `<all_urls>` permission. If granted, future rule creation skips the prompt.

## 3. Logic & Conflict Resolution

### 3.1 Hierarchy of Rules

The extension logic follows a strict hierarchy to determine if the lock should be active:
**`Domain Rule > Page Rule > Session`**

### 3.2 Conflict Handling

- **Upgrade (Page → Domain):** If a user has a rule for `site.com/page` and adds a rule for `site.com`, the **Page rule is silently deleted**. The Domain rule takes precedence.
- **Downgrade (Domain → Page):** If a Domain rule is active, the "Keep Awake (This Page)" button is **disabled** in the UI (or visual state reflects "Active via Domain"). The user must remove the Domain rule before setting a narrower Page rule.

### 3.3 Battery & Error Handling

- **Constraint:** If the OS refuses the lock (e.g., Low Power Mode), the extension **fails silently** on the webpage.
- **Feedback:**
- **Page:** No visible error (prevent disruption).
- **Popup UI:** Displays status "System prevented Wake Lock (Check Battery Settings)."

## 4. Edge Cases & Constraints

### 4.1 Permission Synchronization & Recovery

- **Edge Case:** User revokes site permission via Browser Settings (`about:addons`) while a Rule still exists in Extension Storage.
- **Behavior:**

1. **Detection:** On page load, if a Rule matches, the extension **must** verify `browser.permissions.contains()` before attempting execution.
2. **Action (If Missing):**

- **Execution:** Blocked (Script is not injected).
- **Feedback:** Set Icon Badge to **Error/Warning** color.
- **Recovery:** Extension Popup displays a "Permission Revoked" warning with a "Fix" button to re-request the permission.

### 4.2 Privacy & Environment Constraints

- **Private Browsing (Incognito):**
- **Constraint:** To prevent sensitive browsing history from leaking into permanent storage, **Persistence Rules (Page/Domain) are disabled** in Private windows.
- **UI State:** "Always" buttons are disabled/grayed out. Only "Session Mode" is available.

- **Container Tabs:**
- **Behavior:** Rules are **Global** across all Firefox Container Tabs (e.g., a rule set in "Personal" applies to "Work").

- **Navigation & Caching (bfcache):**
- **Behavior:** Navigating away from a page (including clicking "Back") clears "Session Mode" state.
- **Technical:** The extension must listen to the `pageshow` event to ensure consistent state recovery when pages are loaded from the Back/Forward Cache.

## 5. Technical Architecture

### 5.1 Manifest V3 Configuration

- **Permissions:** `storage`, `scripting`, `activeTab`.
- **Optional Permissions:** `*://*/*` (Used for the Global Toggle).
- **Host Permissions:** None by default.

### 5.2 The Wake Lock Mechanism

- **API:** `navigator.wakeLock.request('screen')` (Modern Web API).
- **Lifecycle:**
- **Acquire:** On button click (Session) or Page Load (Saved Rule).
- **Re-acquire:** On `visibilitychange` (if tab was hidden and becomes visible again).
- **Release:** On tab close, URL change (if no rule matches new URL), or manual toggle off.

- **Error Mapping (Technical):**
- **`NotAllowedError`**: Map to _"System blocked wake lock (Check Battery Saver or Permissions)."_
- **`NotSupportedError`**: Map to _"Device does not support screen wake lock."_
- **Other Errors**: Map to _"Unknown error."_

### 5.3 Android Specifics

- **Development:** Use **Firefox Nightly** for sideloading/debugging.
- **UI Behavior:** **Passive/Silent.** No on-page toasts or notifications. The user verifies state by checking the extension menu/popup.

## 6. Development Roadmap

1. **Phase 1: Local Prototype**

- Develop `manifest.json` and basic `popup.html`.
- Implement `navigator.wakeLock` logic in a content script.
- Test "Session Mode" on Firefox Desktop.

2. **Phase 2: Android Verification**

- Setup Firefox Nightly on Android.
- Create custom Add-on Collection.
- Verify Wake Lock behavior on mobile (handling backgrounding/screen off).

3. **Phase 3: Persistence & Permissions**

- Implement `browser.storage` logic for Page/Domain rules.
- Implement the "Hybrid" permission flow.

4. **Phase 4: Polish & Publish**

- Add error handling (Low Battery/System Block).
- Submit to AMO (Mozilla Add-ons) with "Android Compatible" flag.
