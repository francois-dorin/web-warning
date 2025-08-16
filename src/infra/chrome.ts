import { ISettings, ListEnum } from "../domain/configuration";
import { Message } from "../domain/messages";
import { DeepPartial, IBrowser, ITab } from "./i-browser";

export class ChromeBrowser implements IBrowser {
    public onMessage: (message: Message, sender: any, sendResponse: (response: any) => void) => boolean | Promise<any> = () => false;
    public onIconClicked: () => void = () => {};

    constructor() {
        chrome.runtime.onMessage.addListener(this.handlerMessage.bind(this));
        chrome.action?.onClicked.addListener(this.handlerIconClicked.bind(this));
    }
   
    async getCurrentTab(): Promise<ITab | null> {
        const tabs = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });
        const currentTab = tabs.length > 0 ? tabs[0] : null;
        return currentTab;
    }

    openOptionsPage() {
        chrome.runtime.openOptionsPage();
    }

    public sendMessageToExtension<T>(message: Message): Promise<T> {
        return chrome.runtime.sendMessage(message);
    }

    public sendMessageToTab<T>(tabID: number, message: Message): Promise<T> {
        return chrome.tabs.sendMessage(tabID, message);
    }

    public setLocalStorage(data: { [index: string]: any; }): Promise<void> {
        return chrome.storage.local.set(data);
    }

    public getLocalStorage(keys?: null | string | string[] | {[key: string]: any}): Promise<{ [index: string]: any; }> {
        return chrome.storage.local.get(keys);
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