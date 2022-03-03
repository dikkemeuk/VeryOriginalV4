import { Message } from "discord.js";
import { Command } from "@sapphire/framework";
//import { DurationFormatter } from "@sapphire/time-utilities";

export class sticker extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: "sticker",
      aliases: ["sticker"],
      description: "it returns url of a sticker",
    });
  }

  public async messageRun(message: Message) {
    if(!message.stickers || !message.stickers.size) {
        return message.channel.send("Please provide sticker!")
        }

        return message.channel.send(message.stickers.first()!.url)

  }
}