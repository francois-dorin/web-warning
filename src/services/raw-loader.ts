export class RawLoader {
    public extractDomains(content: string): string[] {
      let lines = content?.split('\n') || [];
      
      for(let i = 0; i < lines.length; ++i) {
        lines[i] = lines[i].trim();
      }

      lines = lines.filter(x => x);

      return lines;
    }
}