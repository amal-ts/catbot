import { ExtendedInteraction } from "../typings/Command";
import {
  ApplicationCommandDataResolvable,
  Client,
  ClientEvents,
  Collection,
} from "discord.js";
import { CommandType } from "../typings/Command";
import glob from "glob";
import { promisify } from "util";
import { RegisterCommandsOptions } from "../typings/client";
import { Event } from "./Event";
import { PrismaClient } from "@prisma/client";

const globPromise = promisify(glob);

export class ExtendedClient extends Client {
  public db = new PrismaClient();
  commands: Collection<string, CommandType> = new Collection();
  logger: any;

  constructor() {
    super({ intents: 32767 });
  }

  start() {
    this.registerModules();
    this.login(process.env.botToken);
  }

  async importFile(filePath: string) {
    return (await import(filePath))?.default;
  }

  async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
    if (guildId) {
      this.guilds.cache.get(guildId)?.commands.set(commands);
      console.log(`Registering commands to ${guildId}`);
    } else {
      this.application?.commands.set(commands);
      console.log("Registering global commands");
    }
  }

  async registerModules() {
    // Commands
    const slashCommands: ApplicationCommandDataResolvable[] = [];
    const commandFiles = await globPromise(
      `${__dirname}/../commands/*/*{.ts,.js}`
    );
    commandFiles.forEach(async (filePath) => {
      const command: CommandType = await this.importFile(filePath);
      if (!command.name) return;
      console.log(command);

      this.commands.set(command.name, command);
      slashCommands.push(command);
    });

    // Add the catfact command explicitly
    const catfactCommand = require("../events/service/catfact").default;
    this.commands.set(catfactCommand.name, catfactCommand);
    slashCommands.push(catfactCommand);

    // Add the history command explicitly
    const historyCommand = require("../commands/history").default;
    this.commands.set(historyCommand.name, historyCommand);
    slashCommands.push(historyCommand);

    this.on("ready", () => {
      this.registerCommands({
        commands: slashCommands,
        guildId: process.env.guildId,
      });
    });

    const eventFiles = await globPromise(`${__dirname}/../events/*{.ts,.js}`);
    eventFiles.forEach(async (filePath) => {
      try {
        const event: Event<keyof ClientEvents> = await this.importFile(
          filePath
        );
        this.on(event.event, event.run);
      } catch (error) {
        console.error(`Error loading event file ${filePath}:`, error);
      }
    });
  }
  catch(error) {
    console.error("Error registering modules:", error);
  }
}
export { ExtendedInteraction };
