import { ApplicationCommandOptionTypes, ApplicationCommandTypes, InteractionResponseTypes, sendMessage, getAvatarURL, editOriginalInteractionResponse } from '../../deps.ts'
import { createCommand } from './mod.ts'
import { scrape, query } from '../utils/generator.ts';

const PROMPT = `What is the thing this website displays? Only talk about that very thing, don't mention the website itself. Start your sentence with "A" and describe the thing very shortly. At most 200 characters. If the text shows an inability to load the website due to a JavaScript error, or if you see any other error about the website not being able to load, or if there is no meta description or website text to generate an accurate description, respond simply with: "A further description could not be generated." and nothing else. Prioritize the meta description over the website text. But still take the website text into account.`

createCommand({
  name: 'resource',
  description: 'Create a resource.',
  type: ApplicationCommandTypes.ChatInput,
  options: [
    {
      name: "url",
      description: "A link to your resource.",
      type: ApplicationCommandOptionTypes.String,
      required: true,
    },
    {
      name: "title",
      description: "A link to your resource.",
      type: ApplicationCommandOptionTypes.String,
    }
  ],
  scope: 'Global',
  execute: async (bot, interaction) => {
    try {
      if(!interaction.guildId) return;

      const user = interaction.user;
      
      const [url, title] = [...interaction.data!.options!.values()];
      console.log(title);

      await bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
        type: InteractionResponseTypes.DeferredChannelMessageWithSource,
        data: {
          flags: 64,
          content: `Generating resource...`,
        },
      })

      const urlObj = new URL(url.value as string);
      const site = await scrape(urlObj.href);

      const data = await query(`Title: ${site.title}\n\nMeta Description: ${site.metaDescription}\n\nWebsite Text: ${site.cleanedText.length < 2000 ? site.cleanedText : site.cleanedText.substring(0, 1999)}\n\n${PROMPT}`)

      const msg = data.detail.choices[0].message.content;

      await sendMessage(bot, interaction.channelId!, {
        embeds: [{
          title: title === undefined ? site.title : title.value as string,
          description: msg + `\n\n${urlObj.href}`,
          thumbnail: {
            url: "https://avatars.githubusercontent.com/u/139475175"
          },
          color: 0x1abc9c,
          footer: {
            text: user.discriminator === "0" ? `Created by @${user.username}` : `Created by ${user.username}#${user.discriminator}`,
            iconUrl: getAvatarURL(bot, user.id, user.discriminator, { avatar: user.avatar! })
          },     
        }] 
      });

      await editOriginalInteractionResponse(bot, interaction.token, {
        content: `Resource successfully generated.`,
      })
    } catch(e) {
      console.log(e)
      await editOriginalInteractionResponse(bot, interaction.token, {
        content: `An invalid URL was provided.`,
      })
    }
  },
})
