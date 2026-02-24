# Caffeine: Keep your screen awake

A browser extension that prevents your screen from dimming or going to sleep, using the modern [Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API).

## Features

- **Manual Toggle**: Instantly keep your screen awake with a single click.
- **Rule-based Activation**: Configure specific websites or pages where the screen should always remain awake.
- **Cross-browser Support**: Optimized for Chrome, Firefox, and Firefox for Android.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)

### Installation

1. Clone the repository.
2. Install dependencies:

   ```bash
   pnpm install
   ```

## Development

### Running the Extension locally

- **Chrome/Chromium**:
  ```bash
  pnpm dev
  ```
- **Firefox Desktop**:
  ```bash
  pnpm dev:firefox
  ```

### Testing on Android (Firefox)

To test the extension on Firefox for Android via Wireless Debugging:

#### 1. Prepare Your Device

1. Connect your computer and Android device to the **same Wi-Fi network**.
2. Go to **Settings > Developer Options** and ensure **USB Debugging** is ON.
3. Enable **Wireless Debugging** and tap the text to enter its settings.

#### 2. Pair and Connect

1. Tap **"Pair device with pairing code"** to see your IP/Port and Pairing Code.
2. On your computer, run:
   ```bash
   adb pair [IP_ADDRESS]:[PORT]
   ```
3. Enter the pairing code.
4. Back on the main Wireless Debugging screen, find the **Device address** and run:
   ```bash
   adb connect [IP_ADDRESS]:[PORT]
   ```

#### 3. Launch Development Build

Ensure the IP in the `dev:firefox:android` script in `package.json` matches your device's address, then run:

```bash
pnpm dev:firefox:android
```

> **Quick Fixes if connection fails:**
>
> - Restart ADB: `adb kill-server && adb start-server`
> - Toggle Wi-Fi on both devices.
> - "Forget" previously paired devices in Android settings and start fresh.

## Scripts

- `pnpm build`: Generate production-ready artifacts in `/dist`.
- `pnpm test`: Run the Vitest suite.
- `pnpm lint`: Run linting checks using `oxlint`.
- `pnpm fmt`: Format code using `oxfmt`.

## License

MIT
