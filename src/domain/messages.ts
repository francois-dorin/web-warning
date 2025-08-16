import { ISettings, ListEnum } from "./configuration"

export type Message = 
{
    action: 'updateDomainList',
    domains: string[]
} |
{
    action: 'updateList',
    list: ListEnum,
    content: string
} |
{
    action: 'enableList',
    list: ListEnum,
    enabled: boolean
} |
{
    action: 'downloadList',
    list: ListEnum
} |
{
    action: 'getDomainList' | 'getInfos' | 'getSettings' 
}


export type PageInfo = {
    domain: string,
    googleAdsID: string | null,
}