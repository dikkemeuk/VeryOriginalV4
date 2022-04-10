import type { SlashCommandBuilder } from "@discordjs/builders";
import { ApplicationCommandRegistry, Command, RegisterBehavior } from "@sapphire/framework";
import type { CommandInteraction, GuildMember, Message } from "discord.js";
import SendDeprecationMessage from "../lib/utils/SendSlashMessage";

export default class MusicCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: "volume",
            description: "Change the volume of the music.",
            preconditions: ["GuildOnly"]
        });
    }

    public async messageRun(message: Message) {
        return SendDeprecationMessage(message);
    }

    public async chatInputRun(interaction: CommandInteraction) {
        
        const volume = interaction.options.getInteger("volume");
        if(!volume) return interaction.reply({ content: "You need to provide a volume to set the bot to.", ephemeral: true});

        const player = this.container.client.manager.get(interaction.guildId!);
        if(!player) return interaction.reply("I can't find a player for this guild.");

        if((interaction.member as GuildMember).voice.channelId !== player.voiceChannel) return interaction.reply("You need to be in the same voice channel as the bot to change the volume.");

        player.setVolume(volume);
        return interaction.reply(`Set the volume to **${volume}**.`);
    }

    public registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry //
			.registerChatInputCommand(
				(builder: SlashCommandBuilder) =>
					builder //
						.setName(this.name)
						.setDescription(this.description)
                        .addIntegerOption(opt => opt.setName("volume")
                        .setRequired(true)
                        .setDescription("The volume to set the bot to.")
                        .setMinValue(0)
                        .setMaxValue(100))		
				,{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
			);
    }
}