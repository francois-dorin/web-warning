import { configuration, ISetting, ISettings, ListEnum } from '../../domain/configuration';
import { browserEngine } from '../../infra/browser-engine';
import { RawLoader } from '../../services/raw-loader';
import { extension } from '../../services/extension';

let file: HTMLInputElement | null = null;

document.addEventListener('DOMContentLoaded', () => { 
  const button = document.getElementById('update-domains');
  file = document.getElementById('file') as HTMLInputElement;

  button?.addEventListener('click', loadFile);
  file?.addEventListener('input', fileSelected);

  uiLoadLists();
  loadList();
});

async function loadFile(_: Event) {
  file?.click();  
}

async function fileSelected(_: Event) {
  if (file && file.files && file.files.length > 0) {
    const reader = new FileReader();
    reader.readAsText(file.files[0], 'UTF-8');
    reader.onload = x => {
      const extractor = new RawLoader();
      const content = x.target?.result as string | null;   
      
      if (content) {
        extension.updateList(ListEnum.manual, content).then(() => loadList());
      }
    }
  }  
}


async function loadList() {
  browserEngine.sendMessageToExtension<{list:string[], lastUpdate: string}>({
    action: 'getDomainList'
  }).then((response) => {
    setListCount(response.list);
    setLastUpdateDate(response.lastUpdate);
  })
  
  // browser.runtime.sendMessage({
  //   action: 'getDomainList'
  // }).then((response) => {
  //   setListCount(response.list);
  //   setLastUpdateDate(response.lastUpdate);
  // })
}

function setListCount(list: string[]) {
  const count = document.getElementById('nb-domains');

  if (count) {
    count.innerText = list.length.toString();
  }
}
function setLastUpdateDate(lastUpdate: string) {
  const span = document.getElementById('last-update');

  if (span) {
    if (lastUpdate) {
      const date =  new Date(lastUpdate);
      span.innerText = date.toLocaleDateString() + ' à ' + date.toLocaleTimeString();
    } else {
      span.innerText = 'Date de dernière mise à jour non connue';
    }
  }
}

function uiLoadLists() {  
  const list = document.getElementById('lists');

  if (list) {
    for(const key in ListEnum) {
      if (key != ListEnum.manual) {
        const info = configuration[key];
        const li = document.createElement('li');
        const input = document.createElement('input');
        const labelContainer = document.createElement('div');
        const a = document.createElement('a');
        const div = document.createElement('div');
        const syncButton = document.createElement('button');

        input.type = 'checkbox';
        input.id = 'input-' + key;
        input.addEventListener('input', () => toggleInput(key as ListEnum, input));
        a.href = info.infoUrl;
        a.innerText = info.name;      
        a.target = '_blank';

        div.classList.add('list-info');
        div.innerHTML = `Nombre de domaines : <span id="nb-domains-${key}"></span> - Dernière mise à jour : <span id="update-${key}"></span>`

        syncButton.innerText = 'Actualiser';
        syncButton.addEventListener('click', () => refresh(key as ListEnum));
        labelContainer.classList.add('list-item-container');
        labelContainer.appendChild(a);
        labelContainer.appendChild(syncButton);
        labelContainer.appendChild(div);
        li.appendChild(input);
        li.appendChild(labelContainer);
        list?.appendChild(li);

      }
    }
  } 

  extension.getSettings().then((response) => {
    for(const key in ListEnum) {
      const setting = response[key];
      uiUpdateInfo(key as ListEnum, setting);
    }
  })

}

function uiUpdateInfo(key: ListEnum, info: ISetting | undefined) {
  const input = document.getElementById('input-' + key) as HTMLInputElement;    
  const date = document.getElementById('update-' + key);
  const nbDomains = document.getElementById('nb-domains-' + key);

  if (input && info?.enabled) {
      input.checked = info.enabled;
  }

  if (date) {
    date.innerText = info?.lastUpdate ? new Date(info.lastUpdate).toLocaleString() : 'Liste jamais téléchargée'
  }

  if (nbDomains) {
    nbDomains.innerText = info === undefined || info.nbDomaines === null || info.nbDomaines === undefined ? 'Non disponible' : info.nbDomaines.toString();
  }

}

function toggleInput(key: ListEnum, input: HTMLInputElement) {
  browserEngine.sendMessageToExtension({
    action: 'enableList',
    list: key,
    enabled: input.checked
  }).then(() => console.log('list updated'));
}

function refresh(list: ListEnum): void {
  extension
    .refreshList(list)
    .then(() => extension.getSettings())
    .then(x => uiUpdateInfo(list, x[list]));
}

