import { configuration, ISettings, ListEnum } from "../../domain/configuration";
import { Message, PageInfo } from "../../domain/messages";
import { browserEngine } from "../../infra/browser-engine"

console.log('content script loading');
const cache: {[index:string]: ListEnum | null} = {};

let regexDomain = /^https?:\/\/([^\/]+).*$/ 
let settings: ISettings | null = null;

type Category = {
  name: string;
  icon: string;
  linkClass: string;
  urls: string[]

}
const categories: {[index: string]: Category} = {
  "danger": {
    name: "danger",
    icon: "icon-danger",
    linkClass: "web-warning-link-danger",
    urls: []
  },
  "warning": {
    name: "warning",
    icon: "icon-warning",
    linkClass: "web-warning-link-warning",
    urls: []
  },
  "normal": {
    name: "normal",
    icon: "icon-normal",
    linkClass: '',
    urls: []
  }
}

async function analyzePage() {
  //await loadList();
  const links = document.querySelectorAll('a[href]:not([data-web-warning-category])') as NodeListOf<HTMLAnchorElement>;
  links.forEach(checkLink);
}

async function checkLink(link: HTMLAnchorElement) {
  const url = link.href;

  if (link.textContent?.trim()) {
    const match = regexDomain.exec(url);

    if (match && match.length >= 2) {
      const domain = match[1];
      if (!check(link, domain, categories.danger)) {
        const text = link.textContent.trim();
        const domainsFromText = extractDomainsFromText(text);
        const domainsFromUrl = extractDomainsFromUrlPath(url);
        let domains: string[];

        domains = [...domainsFromText, ...domainsFromUrl];
        domains = [...new Set(domains)]; // retrait des doublons

        for(let i = 0; i < domains.length; ++i) {
          if (check(link, domains[i], categories.warning)) {
            return;
          }
        }

        categories.normal.urls.push(link.href);
      }      
    }
  }
}

function check(link: HTMLAnchorElement, domain: string, category: Category) {
  if (!settings) {
    return false;
  } else {
    let domainToCheck = stripWWW(domain);

    const list = isInList(domainToCheck);
    
    if (list) {
      addCategoryImage(link, category, list);    
      category.urls.push(link.href);
      return true;
    }
    return false;
  }
}


function addCategoryImage(linkElement: HTMLAnchorElement, category: Category, list: ListEnum) {  
  const badge = document.createElement('span');
  const label = document.createElement('span');
  const item = document.createElement('span');

  label.innerText='WW';
  label.classList.add('web-warning-badge-label');
  item.innerText = configuration[list].shortName;
  item.classList.add('web-warning-badge-item');
  badge.classList.add('web-warning-badge');
  badge.appendChild(label);
  badge.appendChild(item);
  badge.title = `WebWarning : Lien identifié par : ${configuration[list].name}`;

  linkElement.setAttribute('data-web-warning-category', category.name);
  linkElement.setAttribute('data-web-warning-list', list);
  linkElement.insertAdjacentElement('afterbegin', badge);
  linkElement.classList.add(category.linkClass);
}

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes && mutation.addedNodes.length > 0) {
      const newLinks: HTMLAnchorElement[] = [];
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          if (element.tagName === 'A' && element.hasAttribute('href') && !element.hasAttribute('data-web-warning-category')) {
            newLinks.push(element as HTMLAnchorElement);
          }
          const childLinks = element.querySelectorAll('a[href]:not([data-web-warning-category])') as NodeListOf<HTMLAnchorElement>;
          newLinks.push(...childLinks);
        }
      });

      newLinks.forEach(checkLink);
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

function checkAdsID(): string | null {
  const html = document.documentElement.innerHTML;
  const match = /\/adsbygoogle\.js\?client=([^"]+)"/.exec(html);
  let id: string | null = null;

  if (match && match.length >= 2) {
    id = match[1];
  }

  return id;
}

function getCurrentDomain(): string {
  const url = document.location.href;
  const match = url.match(regexDomain);

  if (match) {
    return match[1];
  } else {
    return '';
  }
}

function stripWWW(domain: string): string {
  if (domain.startsWith('www.')) {
    return domain.substring(4);
  } else {
    return domain;
  }
}

function isInList(domain: string): ListEnum | null {
  const d = stripWWW(domain);
  let list = cache[domain];

  if (list === undefined) {
    if (settings) {  
      for(let key in ListEnum) {
        const config = settings[key];

        if (config?.enabled || key == ListEnum.manual) {
          if (config.domains?.indexOf(d) != -1) {
            list = key as ListEnum;
            cache[domain] = list;
            return list
          }
        }
      }    
    }

    cache[domain] = null;
    return null;
  }

  return list;
}

function onMessageReceive(message: Message, _:any, sendResponse: (response: PageInfo) => void) {
  const callback = () => {
    const id = checkAdsID();
    const currentDomain = getCurrentDomain();
    const info: PageInfo = {
      domain: currentDomain,
      googleAdsID: id
    };

    sendResponse(info);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    setTimeout(callback, 1);
  }

  return true;
}

function extractDomainsFromUrlPath(url: string) : string[] {  
  let parts = url.toLocaleLowerCase().split('?');
  let path = parts[0];
  let queryParameters = parts.length == 2 ? parts[1] : null;
  let urlParts = path.split('/').filter(x => x && x.indexOf('.') != -1);
  let queryParamParts = queryParameters?.split('&').map(x => {
    const params = x.split('=')
    if (params && params.length == 2) {
      return params[1]
    } else {
      return ''
    }
  });

  parts = [...urlParts, ...queryParamParts ?? []].filter(x => !!x && x.indexOf('.') != -1);

  if (parts.length >= 0) {
    const regex = /^[-a-zA-Z0-9]+\.[-a-zA-Z0-9\.]+$/
    parts = parts.filter(x => regex.test(x));
    return parts;
  }

  return [];
}

function extractDomainsFromText(text: string) : string[] {
  let parts = text.toLocaleLowerCase()
    .split(/[ \/]/)
    .map(x => x.trim())
    .filter(x => !!x && x.indexOf('.') != -1);
  
  if (parts.length >= 0) {
    const regex = /^[a-zA-Z0-9]+\.[a-zA-Z0-9\.]+/
    parts = parts
      .filter(x => regex.test(x));
    return parts;
  }

  return [];
}

browserEngine.onMessage = onMessageReceive;
browserEngine.sendMessageToExtension<ISettings>({action: "getSettings"}).then(x => {
  settings = x;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', analyzePage);
  } else {
    setTimeout(analyzePage, 1);
  }
});

