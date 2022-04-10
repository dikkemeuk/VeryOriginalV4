import { ApplicationCommandRegistry, Command, RegisterBehavior } from "@sapphire/framework";
import { CommandInteraction, Message, MessageEmbed } from "discord.js";
import type { SlashCommandBuilder } from "@discordjs/builders";
import SendDeprecationMessage from "../lib/utils/SendSlashMessage";
import type { gameservers } from "@prisma/client";
import { Player, query, QueryResult, Type } from "gamedig";

export default class MusicCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: "status",
            aliases: ["gt"],
            description: "View stats about the server of your choice",
            preconditions: ["GuildOnly"]
        });
    }

    public async messageRun(message: Message) {
        return SendDeprecationMessage(message);
    }

    public async chatInputRun(interaction: CommandInteraction) {
        if(!interaction.inGuild()) return interaction.reply({ content: "This command can only be used in a guild.", ephemeral: true}); 
        const server = await this.getProperServer(interaction);

        if(!server) {
            return interaction.reply("There are no servers in the tracking list.");
        }

        const result = await this.createQuery(server);


        if (!result) {
          return interaction.reply({
            embeds: [new MessageEmbed()
              .setColor("#ff0000")
              .setTitle("Error")
              .setDescription(
                "It looks like the server is offline..\nIf you're sure it's online there might be a mistake in the paramaters. (remove the server and re-add it)"
              )]
          });
        }
     

    const embed = new MessageEmbed()
      .setTitle(`**${this.escapeMarkdown(result.name)}**`)
      .setDescription(
        `Players: **${result.players.length}**\nMap: **${result.map}**\n\u200b`
      )
      .setFooter(`/connect ${result.connect} | powered by Gamedig!`)
      .setColor("RANDOM");

    if (result.players.length === 0) {
      embed.addField("**Players**", "No players online..");
    } else if (result.players.length > 0 && result.players.length <= 25) {
      const players = result.players as ExtendedPlayer[]
      players
        .sort((a, b) => b.raw!.frags - a.raw!.frags)
        .forEach((entry) => {

          let name = this.escapeMarkdown(entry.name!);
          //@ts-ignore
          embed.addField(
            `**${name}**`, 
            `frags!: ${entry.raw!.frags}\nPing: ${entry.raw!.ping}`,
            true
          );
        });
    } else if (result.players.length > 25) {
      const players = result.players as ExtendedPlayer[]
      embed.addField(
        "**Names:**",
        players
          .sort((a, b) => b.raw!.frags - a.raw!.frags!)
          .map((x) => this.escapeMarkdown(x.name!)).join("\n"),
        true
      );
      //@ts-ignore
      embed.addField(
        "**frags!:**", //@ts-expect-error
        result.players.sort((a, b) => b.raw!.frags! - a.raw.frags!).map((x) => x.raw.frags!),
        true
      );
      //@ts-ignore
      embed.addField(
        "**Ping:**", //@ts-expect-error
        result.players.sort((a, b) => b.raw.frags! - a.raw.frags!).map((x) => x.raw.ping),
        true
      );
    }

    return interaction.reply({ embeds: [embed] });

    }

    private escapeMarkdown(text: string) {
        var unescaped = text.replace(/\\(\*|_|`|~|\\)/g, "$1"); // unescape any "backslashed" character
        var escaped = unescaped.replace(/(\*|\_|\`|\~|\\)/g, "\\$1"); // escape *, _, `, ~, \
        return escaped;
      }

    private async getProperServer(interaction: CommandInteraction) {
        const param = interaction.options.getString("server");
        const servers = await this.container.prisma.gameservers.findMany({where: {guildID: interaction.guildId!}})

        if(servers.length === 0) {
            interaction.reply("There are no servers in the tracking list.");
            return undefined
        }

        const server = servers.find(server => server.name.toLowerCase().includes(param?.toLowerCase() ?? "") ) ?? servers[0];

        return server;
    }

    private async createQuery(server: gameservers) {
        const retVal: QueryResult | null = await query({
            type: server.game as Type,
            host: server.ip,
            port: server.port,
            maxAttempts: 10,
        }).catch(() => null);

        return retVal;
    
    }

    public registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry //
			.registerChatInputCommand(
				(builder: SlashCommandBuilder) =>
					builder //
						.setName(this.name)
						.setDescription(this.description)
                        .addStringOption(opt => opt.setName("server").setDescription("The server to view stats for"))		
				,{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
			);
    }
}

interface ExtendedPlayer extends Player {
  raw: Raw | undefined
}

interface Raw {
  frags: number;
  ping: number;
}