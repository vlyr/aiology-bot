export interface Timezone {
  code: string;
  name: string;
  utcOffset: string;
  offset: number,
  offsetSeconds: number
}

export interface Scrape {
  title: string;
  metaDescription: string;
  cleanedText: string;
}
