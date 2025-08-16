import { ISettings, ListEnum } from "../domain/configuration";
import { Message } from "../domain/messages";
import { browserEngine } from "../infra/browser-engine";


export class Extension {
    getSettings(): Promise<ISettings> {      
        return browserEngine.sendMessageToExtension<ISettings>({action: 'getSettings'})
    }
    
    refreshList(list: ListEnum) {
        const message : Message = {
            action: 'downloadList',
            list: list
        };
        
        return browserEngine.sendMessageToExtension(message);
    }
    
    updateList(list: ListEnum, content: string) : Promise<void> {
        const message : Message = {
            action: 'updateList',
            list: list,
            content: content
        };
        
        return browserEngine.sendMessageToExtension(message);
    }
}

export let extension: Extension = new Extension();

