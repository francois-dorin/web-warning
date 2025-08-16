import { browserEngine } from "../../infra/browser-engine";
import { Message, PageInfo } from "../../domain/messages";

import "../../declarations"
import "../../global";
import css from "./link-popup.css";

document.addEventListener('DOMContentLoaded', () => { 
  const button = document.getElementById('options');
  const check = document.getElementById('checkAdsID');
  const clipboard = document.getElementById('to-clipboard');
  const version = document.getElementById('version');

  button?.addEventListener('click', openOption);
  check?.addEventListener('click', checkAdsID);
  clipboard?.addEventListener('click', copyAdsIDToClipboard);
  checkAdsID();

  if (version) {
    version.innerHTML = __EXTENSION_VERSION__;
  }
});

function openOption() {
    browserEngine.openOptionsPage();
    //browser.runtime.openOptionsPage();
}

let pageInfo: PageInfo | null = null;

type UrlInfo = {
    domain: string,
    url: string,
    count: number
}

type DomainInfo = {
    domain: string,
    urls: {[index: string]: UrlInfo},
    count: number
}

type DomainsInfo = {[index: string]: DomainInfo};

async function checkAdsID() {
    // const tabs = await browser.tabs.query({
    //     active: true,
    //     currentWindow: true
    // });
    // const currentTab = tabs.length > 0 ? tabs[0] : null;
    const currentTab = await browserEngine.getCurrentTab();
    const currentTabID = currentTab?.id;
    
    if (currentTabID) {
        const currentDomain = getDomain(currentTab?.url);
        setDomainName(currentDomain);
        const message: Message = {
            action: 'getInfos'
        };

        const response: PageInfo = await browserEngine.sendMessageToTab(currentTabID, message);

        setAdsIDFieldset(!!response.googleAdsID);

        if (response) {
            pageInfo = response;

            if (response.googleAdsID) {
                setBuildWithLink(pageInfo);     
                setAdsID(pageInfo);                   
            }

            setWikipediaLink(pageInfo);
        } 
        
    }
}

function getUrl(adsID: string): string | null {
    if (adsID) {
        return `https://builtwith.com/relationships/tag/${adsID.toUpperCase()}`;
    } else {
        return null;
    }
}

function getDomain(url :string | undefined) {
    if (url) {
        const regex = /^https?:\/\/([^\/]+).*$/
        const matches = regex.exec(url);

        if (matches && matches.length >= 2) {
            return matches[1];
        } else{
            return null;
        }
    }
}

function copyAdsIDToClipboard() {
    if (pageInfo?.googleAdsID) {
        navigator.clipboard.writeText(pageInfo.googleAdsID).then(() => {
            alertSuccess(`"${pageInfo?.googleAdsID}" copié dans le presse papier `)
        }) 
    }
}

function alertSuccess(message: string) {
    showToast(message);
}

function showToast(message: string, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, duration);
}

function setAdsIDFieldset(hasAds: boolean) {
    const fieldset = document.getElementById('fieldset-ads-id');

    if (hasAds) {
        fieldset?.classList?.add('ads-id-detected');
    } else {
        fieldset?.classList?.remove('ads-id-detected');
    }
}

function setBuildWithLink(pageInfo: PageInfo) {
    if (pageInfo.googleAdsID) {
        const url = getUrl(pageInfo.googleAdsID);
        const a = document.getElementById('link-to-build-with') as HTMLAnchorElement;

        if (a && url) {
            a.href = url;
        }
    }
}

function setWikipediaLink(pageInfo: PageInfo) {
    const url = getUrlWikipedia(pageInfo.domain);
    const a = document.getElementById('link-to-wikipedia') as HTMLAnchorElement;

    if (a && url) {
        a.href = url;
    }
}


function setAdsID(pageInfo: PageInfo) {
    const span = document.getElementById('ads-id');

    if (span) {
        span.innerText = pageInfo.googleAdsID || '';
    }
}

function setDomainName(domain: string | null| undefined) {
    const element = document.getElementById('domain-name');

    if (element && domain) {
        element.innerText = domain;
    }
}

function getUrlWikipedia(domain: string | null): string {    
    return `https://fr.wikipedia.org/wiki/Sp%C3%A9cial:Recherche_de_lien/${domain}`;
}

function updateDomainInfo(domains: DomainsInfo, url: string): void {
    const domain = getDomain(url);

    if (domain) {
        let domainInfo = domains[domain];
        let urlInfo: UrlInfo | undefined = undefined;

        if (domainInfo === undefined) {   
            domainInfo = {
                domain: domain,
                urls: {},
                count: 0
            };

            domains[domain] = domainInfo;
        }

        urlInfo = domainInfo.urls[url];

        if (urlInfo === undefined) {
            urlInfo = {
                domain: domain,
                url: url,
                count: 0
            }

            domainInfo.urls[url] = urlInfo;
        }

        urlInfo!.count++;
    }    
}

function getDomainRow(domain: DomainInfo): string {
    const urls = Object.values(domain.urls);
    urls.sort((a,b) => a.domain.localeCompare(b.domain));
    const htmlForURL = `<ul>${urls.map(x => `<li><a href="${x.url}" target="_blank">${x.url}</a> (x${x.count})`).join('')}</ul>`;
    return `<tr><td>${domain.domain}</td><td>${htmlForURL}</td></tr>`
}