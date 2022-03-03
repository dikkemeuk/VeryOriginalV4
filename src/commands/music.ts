import { ApplicationCommandRegistry, Command, RegisterBehavior } from "@sapphire/framework";
import { CommandInteraction, GuildMember, MessageEmbed } from "discord.js";
import { LazyPaginatedMessage } from "@sapphire/discord.js-utilities";
import type { Track } from "erela.js";
import { DurationFormatter } from "@sapphire/time-utilities";

export default class MusicCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: "music",
            description: "Use music commands to interact with the bot.",
        });
    }

    public async chatInputRun(interaction: CommandInteraction) {
        if(!interaction.inGuild()) return interaction.reply("This command can only be used in a guild."); 

        const subcommand = interaction.options.getSubcommand()

        if(!subcommand) return interaction.reply("Somehow you managed to completely fail to provide a subcommand.");

        switch(subcommand) {
            case "play":
                return this.play(interaction);
            case "skip":
                return this.skip(interaction);
            case "pause":
                return this.pause(interaction);
            case "resume":
                return this.resume(interaction);
            case "leave":
                return this.leave(interaction);
            case "volume":
                return this.volume(interaction);
            case "queue":
                return this.queue(interaction);
            case "nowplaying":
                return this.nowplaying(interaction);
        }
    }

    public registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry //
			.registerChatInputCommand(
				(builder) =>
					builder //
						.setName(this.name)
						.setDescription(this.description)
                        .addSubcommand(opt => opt.setName("play").setDescription("Provide a song to play.").addStringOption(opt => opt.setName("song").setRequired(true).setDescription("The song to play.")))
                        .addSubcommand(opt => opt.setName("pause").setDescription("Pause the current song."))
                        .addSubcommand(opt => opt.setName("resume").setDescription("Resume the current song."))
                        .addSubcommand(opt => opt.setName("skip").setDescription("Skip the current song.").addBooleanOption(opt => opt.setName("force").setDescription("Forcefully skip the song.")))
                        .addSubcommand(opt => opt.setName("queue").setDescription("View the current queue."))
                        .addSubcommand(opt => opt.setName("leave").setDescription("Make me leave the current voice channel."))
                        .addSubcommand(opt => opt.setName("volume").setDescription("Change the volume of the bot.").addIntegerOption(opt => opt.setName("volume").setRequired(true).setDescription("The volume to set the bot to.").setMinValue(0).setMaxValue(100)))
                        .addSubcommand(opt => opt.setName("nowplaying").setDescription("View the current song."))
						
				,{ guildIds: ["633728899808886814"], idHints: ["948945107493740567"],behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
			);
    }

    private async play(interaction: CommandInteraction) {
        await interaction.deferReply();
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
        
          // Connect to the voice channel and add the track to the queue
        player.connect();
        player.queue.add(res.tracks[0]);

        if(res.loadType === "PLAYLIST_LOADED") {
            const tracks = res.tracks.slice(1);
            tracks.forEach(track => player.queue.add(track));
        }


        if (!player.playing && !player.paused) player.play()

        return interaction.editReply(`Added **${res.tracks[0].title}**${res.playlist ? ` and ${res.tracks.length - 1} more songs` : ""} to the queue.`);

    }

    private async skip(interaction: CommandInteraction) {
        return interaction.reply("Not yet implemented.");
    }

    private async pause(interaction: CommandInteraction) {
        return interaction.reply("Not yet implemented.");
    }

    private async resume(interaction: CommandInteraction) {
        return interaction.reply("Not yet implemented.");
    }

    private async leave(interaction: CommandInteraction) {
        return interaction.reply("Not yet implemented.");
    }

    private async volume(interaction: CommandInteraction) {
        const volume = interaction.options.getInteger("volume");
        if(!volume) return interaction.reply("You need to provide a volume to set the bot to.");

        const player = this.container.client.manager.get(interaction.guildId!);
        if(!player) return interaction.reply("I can't find a player for this guild.");

        player.setVolume(volume);
        return interaction.reply(`Set the volume to **${volume}**.`);
    }

    private async queue(interaction: CommandInteraction) {
        const player = this.container.client.manager.get(interaction.guildId!);
        if(!player) return interaction.reply("I can't find a player for this guild.");

        const queue = player.queue

        if(!queue.size) return interaction.reply("The queue is empty.");

        const paginas = new LazyPaginatedMessage().setSelectMenuOptions((pageIndex) => ({ label: queue[pageIndex - 1].title}));

        for(let i = 0; i < 25; i++) {
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

            paginas.addPage({embeds: [embed]}).setSelectMenuOptions;
            
        }

        return paginas.run(interaction);
    }

    private async nowplaying(interaction: CommandInteraction) {
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
            Position: ${this.filledBar(player.position / 1000, player.queue.current?.duration! / 1000)}`)
            .addField("Requested by", `${track.requester}`)

        return interaction.reply({embeds: [embed], ephemeral: true});
    }

    private filledBar(elapsed: number, total: number) {
        //create a bar of 20 characters
        const barLength = 20;

        //make a bar of the specified length
        let bar = "";
        for(let i = 0; i < barLength; i++) {
            //add a character to the bar
            bar += "=";
        }

        //calculate the amount of "█" to represent the elapsed time
        const elapsedBarLength = Math.floor(elapsed / total * barLength);

        //add the elapsed time to the bar
        bar = bar.substr(0, elapsedBarLength) + "▶️ " + bar.substr(elapsedBarLength + 1);

        //return the bar
        return bar;

    }

}