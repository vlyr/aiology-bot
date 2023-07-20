import type { Scrape } from '../types.ts';
import { ChatGPTAPI } from 'https://esm.sh/chatgpt@5.2.5';
import { OPENAI_API_KEY } from '../../configs.ts';

export const api = new ChatGPTAPI({
  apiKey: OPENAI_API_KEY
})

const scrape = async(url: string): Promise<Scrape> => {
  const cmd = await new Deno.Command("python3", {
    args: ["scraper.py", url]
  }).output();

  console.log(cmd);

  const s = new TextDecoder().decode(cmd.stdout)

  const [title, metaDesc, cleanedText] = s.split("----");

  return {
    title,
    metaDescription: metaDesc,
    cleanedText
  }

}

const query = async(query: string) => {
  return await api.sendMessage(query);
}

export {
  scrape,
  query
}
