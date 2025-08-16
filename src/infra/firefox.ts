import { ISettings } from "../domain/configuration";
import { Message } from "../domain/messages";
import { DeepPartial, IBrowser, ITab } from "./i-browser";

export class FirefoxBrowser implements IBrowser {
    public onMessage: (message: Message, sender: any, sendResponse: (response: any) => void) => boolean | Promise<any> = () => false;
    public onIconClicked: () => void = () => {};

    constructor() {
        browser.runtime.onMessage.addListener(this.handlerMessage.bind(this));
        browser.action?.onClicked.addListener(this.handlerIconClicked.bind(this));
    }

    setLocalStorage(data: { [index: string]: any; }): Promise<void> {
        return browser.storage.local.set(data);
    }

    getLocalStorage(keys?: null | string | string[] | {[key: string]: any}): Promise<{ [index: string]: any; }> {
        return browser.storage.local.get(keys);
    }

    async getCurrentTab(): Promise<ITab | null> {
        const tabs = await browser.tabs.query({
            active: true,
            currentWindow: true
        });
        const currentTab = tabs.length > 0 ? tabs[0] : null;
        return currentTab;
    }

    openOptionsPage() {
        browser.runtime.openOptionsPage();
    }

    public sendMessageToExtension<T>(message: Message): Promise<T> {
        return browser.runtime.sendMessage(message);
    }

    public sendMessageToTab<T>(tabID: number, message: Message): Promise<T> {
        return browser.tabs.sendMessage(tabID, message);
    }

    private handlerMessage(message: any, sender: any, sendResponse:(response: any) => void) {
        if (this.onMessage) {
            return this.onMessage(message, sender, sendResponse);
        }
    }

    private handlerIconClicked(): void {
        if (this.onIconClicked) {
            this.onIconClicked();
        }
    }

}