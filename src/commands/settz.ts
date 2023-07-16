import { ApplicationCommandTypes, ApplicationCommandOptionTypes, addRole, createRole, InteractionResponseTypes } from '../../deps.ts'
import { getGuildFromId } from '../utils/helpers.ts'
import { createCommand } from './mod.ts'
import { timezoneUtc, updateRoles, getTimezoneObj, getLocalTimeStr } from '../utils/timezone.ts';

createCommand({
  name: 'settz',
  description: 'Sets user\'s timezone',
  options: [
    {
      name: "timezone",
      description: "The target timezone",
      required: true,
      type: ApplicationCommandOptionTypes.String,
    }
  ],
  type: ApplicationCommandTypes.ChatInput,
  scope: 'Global',
  execute: async (bot, interaction) => {
    if(!interaction.guildId) return;

    let server = await getGuildFromId(bot, interaction.guildId);

    let userRoles = [...interaction.member!.roles.values()];

    for (const [key, _] of timezoneUtc.entries()) {
      const role = server.roles.find(r => r.name.endsWith(`(${key})`));

      if (role !== undefined) {
        if(userRoles.includes(role.id)) {
          await bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
            type: InteractionResponseTypes.ChannelMessageWithSource,
            data: {
              flags: 64,
              content: `You already have a timezone role assigned.`,
            },
          })
          return;
        }
      }
    }

    const tzInputName = interaction.data!.options!.find(x => x.name === "timezone")!.value;
    if (timezoneUtc.has(tzInputName)) {

        let server = await getGuildFromId(bot, interaction.guildId!);
        const role = [...server.roles.values()].find(r => r.name.endsWith(`(${tzInputName})`));

        if (role !== undefined) {
            await addRole(bot, interaction.guildId, interaction.user.id, role.id)
        } else {
            const localTimeStr = getLocalTimeStr(timezoneUtc.get(tzInputName));

            const newRole = await createRole(bot, interaction.guildId, {
                name: `${localTimeStr} (${tzInputName})`,
                color: 0x9b59b6
            });

            await addRole(bot, interaction.guildId, interaction.user.id, newRole.id)
        }

        const tzObj = getTimezoneObj(tzInputName as string);
        console.log(tzObj);
        await bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
          type: InteractionResponseTypes.ChannelMessageWithSource,
          data: {
            flags: 64,
            content: `Set timezone to **${tzObj.name}** (${tzObj.code}).`,
          },
        })
    } else {
        await bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
          type: InteractionResponseTypes.ChannelMessageWithSource,
          data: {
            flags: 64,
            content: `Invalid Timezone.`,
          },
        })
    }
    updateRoles(bot);
  },
})
