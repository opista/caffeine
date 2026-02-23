import { getDomain } from "tldts";

export const getRootDomain = (url: string) => {
  try {
    const urlObj = new URL(url);
    return getDomain(urlObj.hostname);
  } catch {
    return null;
  }
};
