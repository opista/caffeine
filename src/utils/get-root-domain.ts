import { getDomain } from "tldts";

export const getRootDomain = (url: string) => {
    const urlObj = new URL(url)
    return getDomain(urlObj.hostname);
}