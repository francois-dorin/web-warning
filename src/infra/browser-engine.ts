import { ChromeBrowser } from "./chrome";
import { FirefoxBrowser } from "./firefox";
import { IBrowser } from "./i-browser";

export let browserEngine: IBrowser;

if (typeof browser !== "undefined") {
    browserEngine = new FirefoxBrowser();
} else {
    browserEngine = new ChromeBrowser();
}
