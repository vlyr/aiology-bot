import { ActivityTypes, createBot, enableCachePlugin, enableCacheSweepers, fastFileLoader, GatewayIntents, startBot } from './deps.ts'
import { BOT_ID, BOT_TOKEN } from './configs.ts'
import { logger } from './src/utils/logger.ts'
import { events } from './src/events/mod.ts'
import { updateRoles } from './src/utils/timezone.ts';
import { updateCommands,getGuildFromId } from './src/utils/helpers.ts'
// Import it like this. There might be a newer version of this fix later, but I would not expect much changes.
import { Role, editRole } from './deps.ts';

const log = logger({ name: 'Main' })

log.info('Starting Bot, this might take a while...')

const paths = ['./src/events', './src/commands']

await fastFileLoader(paths).catch((err: any) => {
  log.fatal(`Unable to Import ${paths}`)
  log.fatal(err)
  Deno.exit(1)
})

// @ts-nocheck: no-updated-dependencies

export const bot = enableCachePlugin(
  createBot({
    token: BOT_TOKEN,
    botId: BOT_ID,
    intents: GatewayIntents.Guilds,
    events,
  }),
)

enableCacheSweepers(bot)

setInterval(() => updateRoles(bot), 300000);

bot.gateway.manager.createShardOptions.makePresence = (shardId: number) => {
  return {
    shardId,
    status: 'online',
    activities: [
      {
        name: 'Life',
        type: ActivityTypes.Competing,
        createdAt: Date.now(),
      },
    ],
  }
}

await startBot(bot)
await updateCommands(bot)
