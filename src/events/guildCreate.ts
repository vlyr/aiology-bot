import { events } from './mod.ts'
import { updateGuildCommands } from '../utils/helpers.ts'

events.guildCreate = async (bot: any, guild: any) => await updateGuildCommands(bot, guild)
