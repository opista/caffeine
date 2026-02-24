import { BackgroundManager } from "./background-manager";

export default defineBackground(() => new BackgroundManager().init());
