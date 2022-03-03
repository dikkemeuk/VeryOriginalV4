import { Command } from "@sapphire/framework";
import { Message, MessageEmbed } from "discord.js";

export class PingCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: "serverinfo",
      aliases: ["server info"],
      description: "serverinfo",
    });
  }

  public async messageRun(message: Message) {

    if(!message.guild) {
        return message.channel.send("This command can only be used in a guild.");
    }

    const guildOwner = await message.guild.fetchOwner()

    const embed = new MessageEmbed()
    .setTitle(`Server info for ${message.guild?.name}`)
    .setThumbnail(message.guild?.iconURL() ?? "https://variety.com/wp-content/uploads/2021/07/Rick-Astley-Never-Gonna-Give-You-Up.png?w=1024")
    .addField("Owner", guildOwner.toString())
    .addField("Members", message.guild?.memberCount.toString())
    .addField(`Bots`, message.guild?.members.cache.filter(m => m.user.bot).size.toString())
    .addField(`Humans`, message.guild?.members.cache.filter(m => !m.user.bot).size.toString())
    .addField(`Channels`, message.guild?.channels.cache.size.toString())
    .addField(`Roles`, message.guild?.roles.cache.size > 20 ? "Too much to list!" : message.guild.roles.cache.map(r => r.toString()).join("\n"))
    .setColor(0x00AE86)
    .setTimestamp()
    .setFooter({iconURL: message.guild?.iconURL() ?? "https://variety.com/wp-content/uploads/2021/07/Rick-Astley-Never-Gonna-Give-You-Up.png?w=1024", text: message.guild?.name})
    
    return message.channel.send({embeds: [embed], content: "Heres some info bitch!"})

  }
}
