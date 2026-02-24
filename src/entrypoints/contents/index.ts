import { WakeLockManager } from "./wake-lock-manager";

export default defineContentScript({
  main: () => new WakeLockManager().start(),
});
