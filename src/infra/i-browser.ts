import { Message } from "../domain/messages";
import { ISettings} from "../domain/configuration";

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer I>
    ? Array<DeepPartial<I>>
    : DeepPartial<T[P]>
};

export interface IBrowser {
    /**
     * Callback appelé lors de la réception d'un message
     * @param message 
     * @param sender 
     * @param sendResponse 
     * @returns 
     */
    onMessage: (message: Message, sender: any, sendResponse: (response: any) => void) => boolean | Promise<any>;

    /**
     * Envoi un message
     * @param message 
     * @returns 
     */
    sendMessageToExtension: <T>(message: Message) => Promise<T>;
    
    /**
     * Envoi un message à un onglet
     * @param message 
     * @returns 
     */
    sendMessageToTab: <T>(tabID: number, message: Message) => Promise<T>;

    /**
     * Ouvre la page des options
     */
    openOptionsPage(): void;

    /**
     * Récupère l'onglet actuellement ouvert
     */
    getCurrentTab(): Promise<ITab | null>

    /**
     * Clique sur l'icône
     * @returns 
     */
    onIconClicked: () => void;

    setLocalStorage(data: {[index: string]: any}): Promise<void>;
    getLocalStorage(keys?: null | string | string[] | {[key: string]: any}): Promise<{ [index: string]: any; }>;
}

export interface ITab {
    id?: number;
    url?: string;
}