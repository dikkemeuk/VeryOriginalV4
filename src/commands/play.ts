import { ApplicationCommandRegistry, Command, RegisterBehavior } from "@sapphire/framework";
import { CommandInteraction, GuildMember, Message, MessageEmbed } from "discord.js";
import SendDeprecationMessage from "../lib/utils/SendSlashMessage";

export default class MusicCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: "play",
            description: "Use this command to play music in the voice channel you're in.",
            preconditions: ["GuildOnly"]
        });
    }

    public async messageRun(message: Message) {
        return SendDeprecationMessage(message);
    }

    public async chatInputRun(interaction: CommandInteraction) {
        if(!interaction.inGuild()) return interaction.reply({ content: "This command can only be used in a guild.", ephemeral: true}); 

        await interaction.deferReply({ ephemeral: true });
        const song = interaction.options.getString("song");

        if(!song) return interaction.editReply("You need to provide a song to play.");
        const member = interaction.member as GuildMember
        const voiceChannel = member!.voice.channel;

        if(!voiceChannel) return interaction.editReply("You need to be in a voice channel to use this command.");

        if(!member!.voice.channel?.joinable) return interaction.editReply("I can't join your voice channel.");

        if(interaction.guild?.me?.voice.channelId && interaction.guild.me.voice.channelId !== voiceChannel.id) {
           return interaction.editReply("I need to be in your voice channel to use this command.");
        }

        const res = await this.container.client.manager.search(song, interaction.user);
        if(res.loadType === "LOAD_FAILED") {
            return interaction.editReply(`Failed to load ${song}`);
        }


        if (res.loadType === "NO_MATCHES") {
            return interaction.editReply(`No matches for ${song}`);
        }

        const player = this.container.client.manager.create({
            guild: interaction.guildId!,
            voiceChannel: member.voice.channel.id,
            textChannel: interaction.channelId!,
          });

        if(!interaction.guild?.me?.voice.channelId) {
            console.log("Joining voice channel");
            player.connect();  
        }

        player.queue.add(res.tracks[0]);

        if(res.loadType === "PLAYLIST_LOADED") {
            const tracks = res.tracks.slice(1);
            tracks.forEach(track => player.queue.add(track));
        }


        if (!player.playing && !player.paused && !player.queue.size) player.play()
            const embed = new MessageEmbed()
            .setTitle(`Added to queue:`)
            .setDescription(`[${res.tracks[0].title}](${res.tracks[0].uri}) ${res.tracks[0].isStream ? " (Stream)" : ""} ${res.loadType === "PLAYLIST_LOADED" ? `\nAnd ${res.tracks.length} more tracks` : ""}`)
            .setColor("#0099ff")
            .setThumbnail(res.tracks[0].displayThumbnail("maxresdefault"))
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({dynamic: true}) });

            return interaction.editReply({embeds: [embed]});
        
    }

    public registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry //
			.registerChatInputCommand(
				builder =>
					builder
						.setName(this.name)
						.setDescription(this.description)
                        .addStringOption(opt => opt.setName("song").setRequired(true).setDescription("The song to play."))		
				,{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
			);
    }
}