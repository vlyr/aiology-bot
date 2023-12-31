import { BotWithCache, editRole } from "../../deps.ts";
import type { Timezone } from '../types.ts';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const timezoneJsonData = await Deno.readTextFile("timezones.json");
const timezones = JSON.parse(timezoneJsonData);

export const timezoneUtc = new Map();
timezones.forEach((element: Timezone) => {
    timezoneUtc.set(element.code, element.offsetSeconds)
});

const roleRe = /[0-9]{2}:[0-9]{2} \([a-zA-Z]+\)/;
const timezoneRe = /[a-zA-Z]+/;

export const getTimezoneObj = (timezoneAbbr: string): Timezone | null => {
    for (const i in timezones) {
        if (timezones[i].code === timezoneAbbr.toUpperCase()) {
            return timezones[i];
        }
    }
    return null;
}

export const updateRoles = (bot: BotWithCache) => {
  console.log("Updating timezone roles");

  bot.guilds.forEach(async (guild) => {
      for(const role of guild.roles.values()) {
        if (roleRe.test(role.name)) {
          const roleTz = timezoneRe.exec(role.name)![0].toUpperCase(); // gets the timezone part of the role name in uppercase, e.g. "12:00 aest" -> "AEST"

          const localTimeStr = getLocalTimeStr(timezoneUtc.get(roleTz));

          console.log(`Set ${localTimeStr} (${roleTz})`);

          await editRole(bot, guild.id, role.id, {
              name: `${localTimeStr} (${roleTz})`,
              color: 0x9b59b6,
          });
        }
        sleep(2000)
    }
  });
}

export const getLocalTimeStr = (utcOffset: number) => {
    const d = new Date();
    d.setTime(d.getTime() + utcOffset * 1000);

    const utcMinute = d.getUTCMinutes();
    const utcHour = d.getUTCHours();    

    let currMin = Math.round(utcMinute);
    let currHour = Math.round(utcHour);

    if(currMin < 0) {
        currMin = 60 - Math.abs(currMin);
        currHour--;
    }
    if(currMin > 59) {
        currMin = Math.abs(currMin) - 60;
        currHour++;
    }

    if(currHour < 0) { currHour = 24 - Math.abs(currHour);}
    if(currHour > 24) { currHour = currHour - 24 }

    if(currHour == 24) { currHour = 0 }

    return `${("0" + currHour).slice(-2)}:${("0"+currMin).slice(-2)}`;
}
