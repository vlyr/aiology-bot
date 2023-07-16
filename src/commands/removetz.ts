import { removeRole, ApplicationCommandTypes, InteractionResponseTypes } from '../../deps.ts'
import { getGuildFromId } from '../utils/helpers.ts'
import { createCommand } from './mod.ts'
import { timezoneUtc, updateRoles, getTimezoneObj, getLocalTimeStr } from '../utils/timezone.ts';

createCommand({
  name: 'removetz',
  description: 'Removes a user\'s timezone role.',
  type: ApplicationCommandTypes.ChatInput,
  scope: 'Global',
  execute: async (bot, interaction) => {
    if(!interaction.guildId) return;

    let server = await getGuildFromId(bot, interaction.guildId);

    for (const [key, value] of timezoneUtc.entries()) {
      const role = server.roles.find(r => r.name.endsWith(`(${key})`));

      if (role !== undefined) {
        removeRole(bot, interaction.guildId, interaction.user.id, role.id);
      }
    }
    await bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data: {
        flags: 64,
        content: `Timezone cleared.`,
      },
    })
  },
})
