// Use a relative import so it works before Nuxt aliases are applied (during nuxt.config evaluation)
import siteContent from "../content/site.json";

export const appName: string = siteContent.site.name;
export const appDescription: string = siteContent.site.description;
