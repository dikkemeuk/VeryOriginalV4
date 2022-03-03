import { Args, Command } from "@sapphire/framework";
import { Message, MessageEmbed } from "discord.js";
import { DurationFormatter } from "@sapphire/time-utilities";



export class UserInfo extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: "userinfo",
      aliases: ["uinfo", "user"],
      description: "userinfo",
    });
  }

  public async messageRun(message: Message, args: Args) {

    if(!message.guild) {
        return message.channel.send("This command can only be used in a guild.");
    }

    const member = await args.pick("member").catch(() => message.member)!;

    const formatter = new DurationFormatter()

    const embed = new MessageEmbed()
    .setTitle(`User info for ${member!.user.tag}`)
    .setThumbnail(member!.user.avatarURL() ?? "https://variety.com/wp-content/uploads/2021/07/Rick-Astley-Never-Gonna-Give-You-Up.png?w=1024")
    .addField("ID", member!.user.id)
    .addField("Created At", `${member?.user.createdAt.toDateString()}\n${formatter.format(member!.user.createdTimestamp)}`)
    .addField("Joined At", `${member?.joinedAt!.toDateString()}\n${formatter.format(member!.joinedTimestamp!)}`)
    .addField("Roles", member!.roles.cache.size > 20 && member!.roles.cache.size !== 0 ? `${member?.roles.cache.size ? "Too much roles" : "No roles"}` : member!.roles.cache.map(r => r.toString()).join("\n"))
    .setColor(0x00AE86)

    return message.channel.send({embeds: [embed], content: "Heres some info bitch!"})
  }
}
