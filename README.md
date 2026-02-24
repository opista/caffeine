# Caffeine: Keep your screen awake

A browser extension that prevents your screen from dimming or going to sleep, using the modern [Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API).

## Features

- **Manual Toggle**: Instantly keep your screen awake with a single click.
- **Rule-based Activation**: Configure specific websites or pages where the screen should always remain awake.
- **Cross-browser Support**: Optimized for Chrome, Firefox, and Firefox for Android.

## Environment Requirements

### Operating Systems

- Windows 10 or later
- macOS 12 (Monterey) or later
- Linux (e.g., Ubuntu 22.04+, Fedora 38+)

### Required Programs

- **Node.js**: version `v22.x` or later
  - [Install Node.js](https://nodejs.org/)
- **pnpm**: version `v10.x` or later
  - [Install pnpm](https://pnpm.io/installation)

---

## Step-by-Step Build Instructions

To create an exact copy of the add-on code from source:

1. **Download the source code**: Clone the repository or download the source archive.
2. **Open a terminal**: Navigate to the root folder of the project.
3. **Install dependencies**:
   Run the following command to install all necessary technical dependencies:
   ```bash
   pnpm install
   ```
4. **Execute the build script**:
   To build the production version specifically for Firefox:

   ```bash
   pnpm build:firefox
   ```

   The compiled code will be generated in the `.output/firefox-mv3` directory.

5. **Create the extension package**:
   To generate a `.zip` artifact suitable for Firefox submission:
   ```bash
   pnpm zip:firefox
   ```
   The final package will be created in the `.output/` folder (e.g., `.output/caffeine-0.1.0-firefox-mv3.zip`).

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

- `pnpm dev`: Start the development server (Chrome).
- `pnpm dev:firefox`: Start the development server (Firefox).
- `pnpm build`: Generate production-ready artifacts in `.output/chrome-mv3`.
- `pnpm build:firefox`: Generate production-ready artifacts in `.output/firefox-mv3`.
- `pnpm zip:firefox`: Package the Firefox version into a .zip file in `.output`.
- `pnpm test`: Run the Vitest suite.
- `pnpm lint`: Run linting checks using `oxlint`.
- `pnpm fmt`: Format code using `oxfmt`.

## License

MIT
