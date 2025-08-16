import { Message } from '../../domain/messages';
import { browserEngine } from '../../infra/browser-engine';
import { configuration, FormatEnum, ISetting, ISettings, ListEnum } from '../../domain/configuration';
import { RawLoader} from '../../services/raw-loader';
import { RegexLoader} from '../../services/regex-loader';

const DAY_DURATION_ms = 1000 * 60 * 60 * 24;

let currentSettings: ISettings | null = null;

browserEngine.getLocalStorage().then(x => currentSettings = x.settings);

browserEngine.onMessage = (message: Message, sender, sendResponse) => {
  console.log('message', message);
  const handleMessage = async () => {
    try{
      if (message.action === 'updateDomainList') {
        const domains = message.domains;
        if (domains) {

          browserEngine.setLocalStorage({domains: {
            list: domains,
            lastUpdate: new Date().toISOString()
            }
          });
          return true;
        } else {
          return false;
        }
      }

      if (message.action === 'updateList') {
        updateList(message.list, message.content);
      }
      
      if (message.action === 'getDomainList') {
        const promise = browserEngine.getLocalStorage();
        promise.then(x => {
          let data = x;

          // migration
          if (Array.isArray(x.domains)) {
            data = {
              list: x.domains,
              lastUpdate: ''
            }  
          } else {
            data = x.domains;
          }

          sendResponse(data)
          return true;
        });
        return promise;
      }

      if (message.action == "getSettings") {
        if (currentSettings) {          
          sendResponse(currentSettings);
          return false;       
        } else {
          return browserEngine.getLocalStorage().then(x => {
            currentSettings = x.settings;
            sendResponse(currentSettings);
            return true;
          });
        } 
      }

      if (message.action == "enableList") {
        updateSettingsForList(message.list, x => ({
          ...x,
          enabled: message.enabled
        })).then(() => {
          if (message.enabled) {
            checkForUpdate(message.list);
          }
        }
        )

        

        return true;
      } 

      if (message.action == 'downloadList') {
        return downloadList(message.list);
      }

      return false;
    } catch(ex) {
      console.log("erreur", ex);
    }
  };

  handleMessage()
    .then(sendResponse)
    .catch(error => {
      sendResponse({error: error.message});
    });
  
  return true;
};

function updateList(list: ListEnum, content: string): Promise<void> {
  return updateSettingsForList(list, x => {
    const domains = extractDomainFor(list, content);
    const newValue: ISetting = {...x, 
      rawContent: content,
      domains: extractDomainFor(list, content),
      lastUpdate: new Date().toISOString(),
      nbDomaines: domains.length
    };

    return newValue;
  });
}

async function  updateCurrentSettings(action: (settings: ISettings) => ISettings) {
  return browserEngine.getLocalStorage('settings').then(
    x => {
      const oldSettings = x.settings ?? {};
      const newSettings = action(oldSettings);    
      currentSettings = newSettings;
      return browserEngine.setLocalStorage({settings: newSettings});
    }
  )
}

async function updateSettingsForList(list: ListEnum, action: (setting: ISetting) => ISetting) {
  return updateCurrentSettings(x => {
    const listSettings = x[list] ?? {};
    const newSetting = action(listSettings);
    const newSettings = {
      ...x,
      [list]: newSetting
    }
    return newSettings;
  });
}

function extractDomainFor(list: ListEnum, content: string): string[] {
  const config = configuration[list];
  switch(config.format) {
    case FormatEnum.rawDomain:
      const rawExtractor = new RawLoader();
      return rawExtractor.extractDomains(content);
    case FormatEnum.regex:
      if (config.regex) {
        const regexExtractor = new RegexLoader();
        return regexExtractor.extractDomains(content, config.regex);
      } else {
        return [];
      }
    default:
      console.log('Extractor not implemented: ' + config.format);
      return []
  }
}

function checkForUpdate(list: ListEnum) {
  const now = new Date();
  const yesterday = new Date(now.getTime() - DAY_DURATION_ms);

  console.log('chechForUpdate', list, currentSettings);

  if (currentSettings && 
      currentSettings[list].enabled &&
      (currentSettings[list].lastUpdate == null || new Date(currentSettings[list].lastUpdate) < yesterday)) {
        console.log('send download request', list);
        downloadList(list);
      }
}

function downloadList(list: ListEnum) {
  const config = configuration[list];
  if (config.downloadUrl) {
    return fetch(config.downloadUrl).then(x => {
      if (x.ok) {
        x.text().then(content => {
          return updateList(list, content);
        })
      }
    });
  }
}

