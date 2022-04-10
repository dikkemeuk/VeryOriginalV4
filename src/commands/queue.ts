import { ApplicationCommandRegistry, Command, RegisterBehavior } from "@sapphire/framework";
import { DurationFormatter } from "@sapphire/time-utilities";
import { CommandInteraction, Message, MessageEmbed } from "discord.js";
import type { Track } from "erela.js";
import { LazyPaginatedMessage } from "@sapphire/discord.js-utilities";
import type { SlashCommandBuilder } from "@discordjs/builders";
import SendDeprecationMessage from "../lib/utils/SendSlashMessage";

export default class MusicCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: "queue",
            description: "View the queue of this guild.",
            preconditions: ["GuildOnly"]
        });
    }

    public async messageRun(message: Message) {
        return SendDeprecationMessage(message);
    }

    public async chatInputRun(interaction: CommandInteraction) {
        const player = this.container.client.manager.get(interaction.guildId!);
        if(!player) return interaction.reply("I can't find a player for this guild.");

        const queue = player.queue

        if(!queue.size) return interaction.reply("The queue is empty.");

        const paginas = new LazyPaginatedMessage().setSelectMenuOptions((pageIndex) => ({ label: queue[pageIndex - 1].title}));

        for(let i = 0; i < queue.length - 1; i++) {
            const song = queue[i] as Track
            if(!song) break;

            const embed = new MessageEmbed()
                .setTitle(song.title)
                .setURL(song.uri!)
                .setAuthor({name: song.author})
                .setImage(song.displayThumbnail("maxresdefault"))
                .setColor(0x00FF00)
                .setFooter({text: `${i + 1} of ${queue.size}`})
                .addField("Duration", new DurationFormatter().format(song.duration))

            paginas.addPage({embeds: [embed]})
            
        }

        return paginas.run(interaction);
    }

    public registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry //
			.registerChatInputCommand(
				(builder: SlashCommandBuilder) =>
					builder //
						.setName(this.name)
						.setDescription(this.description)		
				,{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite, idHints: ["962447654338584616"] }
			);
    }
}