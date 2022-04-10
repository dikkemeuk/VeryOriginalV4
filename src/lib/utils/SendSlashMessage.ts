import { Message, MessageEmbed } from "discord.js";

export default function SendDeprecationMessage(message: Message) {
    const embed = new MessageEmbed()
    .setTitle("Warning!")
    .setDescription(`Message commands have been deprecated! Please use the slash commands instead.
    If you have not authorized me to use slashcommands please do so by clicking the link in my profile!`)
    .setColor("#ff0000")

    return message.channel.send({embeds: [embed]})
}