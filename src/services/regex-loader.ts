export class RegexLoader {
    public extractDomains(content: string, regex: RegExp): string[] {
      let lines = content?.split('\n') || [];
      
      for(let i = 0; i < lines.length; ++i) {
        lines[i] = lines[i].trim();
      }

      lines = lines
        .map(x => {
          const result = x.match(regex);

          if (result) {
            return result[1];
          } else {
            return '';
          }
        })
        .filter(x => x);      

      return lines;
    }
}