import { ApplicationCommandRegistry, Command, RegisterBehavior } from "@sapphire/framework";
import { DurationFormatter } from "@sapphire/time-utilities";
import { CommandInteraction, Message, MessageEmbed } from "discord.js";
import type { Track } from "erela.js";
import { filledBar } from "../lib/utils/music";
import type { SlashCommandBuilder } from "@discordjs/builders";
import SendDeprecationMessage from "../lib/utils/SendSlashMessage";

export default class MusicCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: "nowplaying",
            description: "View the song that's currently playing.",
            preconditions: ["GuildOnly"]
        });
    }

    public async messageRun(message: Message) {
        return SendDeprecationMessage(message);
    }

    public async chatInputRun(interaction: CommandInteraction) {
        if(!interaction.inGuild()) return interaction.reply({ content: "This command can only be used in a guild.", ephemeral: true}); 
        
        const player = this.container.client.manager.get(interaction.guildId!);
        if(!player) return interaction.reply("I can't find a player for this guild.");

        const track = player.queue.current as Track;
        if(!track) return interaction.reply("The queue is empty.");

        const embed = new MessageEmbed()
            .setTitle(track.title)
            .setURL(track.uri!)
            .setAuthor({name: track.author})
            .setImage(track.displayThumbnail("maxresdefault"))
            .setColor(0x00FF00)
            .addField("Duration", `${new DurationFormatter().format(track.duration)}
            Position: ${filledBar(player.position / 1000, player.queue.current?.duration! / 1000)}`)
            .addField("Requested by", `${track.requester}`)

        return interaction.reply({embeds: [embed], ephemeral: true});
    }

    public registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry //
			.registerChatInputCommand(
				(builder: SlashCommandBuilder) =>
					builder //
						.setName(this.name)
						.setDescription(this.description)		
				,{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
			);
    }
}