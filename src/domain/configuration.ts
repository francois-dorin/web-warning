export enum ListEnum {
    manual = "manual",
    amf = "amf",
    redFlagDomains = "redFlagDomains",
    //genAI = "genAI",
    uBlacklistHugeAI = "uBlacklistHugeAI"
}

export enum FormatEnum {
    rawDomain = "rawDomain",
    bloomFilter = "bloomFilter",
    regex = "regex"
}

export interface ISetting {
    enabled: boolean;
    lastUpdate: string | null;
    nbDomaines: number | null;
    rawContent: string | null;
    domains: string[] | null;
}

export interface ISettings {
    [index: string]: ISetting
}

export interface IListConfiguration {
    name: string;
    shortName: string;
    infoUrl: string;
    downloadUrl: string;
    format: FormatEnum;
    regex?: RegExp;
}

export const configuration : {    
    [index: string]: IListConfiguration
} = {
    [ListEnum.manual]: {
      name: "Liste personnelle",
      shortName: "Perso.",
      infoUrl: "",
      downloadUrl: "",
      format: FormatEnum.rawDomain
    },
    [ListEnum.amf]: {
        name: "Autorité des Marchés Financiers",
        shortName: "AMF",
        infoUrl: "https://www.amf-france.org/fr/espace-epargnants/proteger-son-epargne/listes-noires-et-mises-en-garde",
        downloadUrl: "https://www.data.gouv.fr/api/1/datasets/r/d2d9df6d-1cd2-41a8-96f5-684cb3057ecb",
        format: FormatEnum.regex,
        regex: /^"(.*?)";/
    },
    [ListEnum.redFlagDomains]: {
        name: "Red Flag Domains",
        shortName: "RFD",
        infoUrl: "https://red.flag.domains/",
        downloadUrl: "https://dl.red.flag.domains/red.flag.domains.txt",
        format: FormatEnum.rawDomain
    },
    // [ListEnum.genAI]: {
    //     name: "GenAI",
    //     shortName: "GenAI",
    //     infoUrl: "https://next.ink/153613/enquete-plus-de-1-000-medias-en-francais-generes-par-ia-polluent-le-web-et-google/",
    //     downloadUrl: "http://gavois.fr/bloom-filter.json",
    //     format: FormatEnum.bloomFilter
    // },
    [ListEnum.uBlacklistHugeAI]: {
        name: "uBlacklist Huge AI",
        shortName:"uAI",
        infoUrl: "https://github.com/laylavish/uBlockOrigin-HUGE-AI-Blocklist/tree/main",
        downloadUrl: "https://github.com/laylavish/uBlockOrigin-HUGE-AI-Blocklist/raw/refs/heads/main/list_uBlacklist.txt",
        format: FormatEnum.regex,
        regex: /^\*:\/\/\*\.([^\/]*?)\/\*/
    }
}