import {
  ApplicationCommandRegistry,
  Command,
  RegisterBehavior,
} from "@sapphire/framework";
import { CommandInteraction, Message, MessageEmbed } from "discord.js";
import SendDeprecationMessage from "../lib/utils/SendSlashMessage";

export default class AddServerCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: "server",
      description: "Add, edit or remove servers from the tracking list",
      preconditions: ["GuildOnly"],
    });
  }

  public async messageRun(message: Message) {
    return SendDeprecationMessage(message);
  }

  public async chatInputRun(interaction: CommandInteraction) {
    const sub = interaction.options.getSubcommand(true);
    await interaction.deferReply();
    if (!sub) {
      return interaction.editReply(
        "Please specify a subcommand. Type `/server` for more information."
      );
    }

    switch (sub) {
      case "add":
        return this.addServer(interaction);
      case "remove":
        return this.removeServer(interaction);
      case "list":
        return this.listServers(interaction);
    }
  }

  private async listServers(interaction: CommandInteraction) {
    const servers = await this.container.prisma.gameservers.findMany({
      where: { guildID: interaction.guildId! },
    });

    if (servers.length === 0) {
      return interaction.reply("There are no servers in the tracking list.");
    }

    const embed = new MessageEmbed()
      .setTitle("Servers in the tracking list")
      .setColor(0x00ff00)
      .setDescription(
        servers
          .map((server) => `>**${server.name}** - ${server.ip}:${server.port}`)
          .join("\n")
      );

    return interaction.editReply({ embeds: [embed] });
  }

  private async addServer(interaction: CommandInteraction) {
    const name = interaction.options.getString("name");
    const ip = interaction.options.getString("ip");
    const port = interaction.options.getInteger("port");
    const game = interaction.options.getString("game");

    if (!name || !ip || !port || !game) {
      return interaction.editReply(
        "Please specify a name, ip, port and game. Type `/server` for more information."
      );
    }

    const server = {
      name,
      ip,
      port,
      game,
      guildID: interaction.guildId!,
    };

    const exists = await this.container.prisma.gameservers.findFirst({
      where: { name },
    });

    if (exists) {
      return interaction.editReply(`Server ${name} already exists.`);
    }

    await this.container.prisma.gameservers.create({ data: server });

    return interaction.editReply(`Added server ${name} to the tracking list.`);
  }

  private async removeServer(interaction: CommandInteraction) {
    const name = interaction.options.getString("name");

    if (!name) {
      return interaction.editReply(
        "Please specify a name. Type `/server` for more information."
      );
    }

    const server = await this.container.prisma.gameservers.findFirst({
      where: { name },
    });

    if (!server) {
      return interaction.editReply(`Server ${name} does not exist.`);
    }

    await this.container.prisma.gameservers.delete({
      where: { uniqueID: server.uniqueID },
    });

    return interaction.editReply(
      `Removed server ${name} from the tracking list.`
    );
  }

  public registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry //
      .registerChatInputCommand(
        (builder) =>
          builder //
            .setName("server")
            .setDescription(this.description)
            .addSubcommand((sub) =>
              sub
                .setName("add")
                .setDescription("Add a server to the tracking list")
                .addStringOption((opt) =>
                  opt
                    .setName("name")
                    .setRequired(true)
                    .setDescription(
                      "The name of the server to add to the tracking list (keep it short)"
                    )
                    .setRequired(true)
                )
                .addStringOption((opt) =>
                  opt
                    .setName("ip")
                    .setRequired(true)
                    .setDescription(
                      "The IP of the server to add to the tracking list"
                    )
                )
                .addIntegerOption((opt) =>
                  opt
                    .setName("port")
                    .setRequired(true)
                    .setDescription(
                      "The port of the server to add to the tracking list"
                    )
                )
                .addStringOption((opt) =>
                  opt
                    .setName("game")
                    .setRequired(true)
                    .setDescription("The game the server is running on")
                    .addChoice("Call of Duty 1", "cod")
                    .addChoice("Call of Duty United Offensive", "coduo")
                    .addChoice("Call of Duty 2", "cod2")
                    .addChoice("Call of Duty 3", "cod3")
                    .addChoice("Call of Duty Modern Warfare", "cod4")
                    .addChoice("Call of Duty World at War", "codwaw")
                    .addChoice("Call of Duty Modern Warfare 2", "codmw2")
                    .addChoice("Call of Duty Modern Warfare 3", "codmw3")
                    .addChoice("DayZ", "dayz")
                    .addChoice("FiveM", "fivem")
                    .addChoice("Garry's Mod", "garrysmod")
                    .addChoice("Minecraft", "minecraft")
                    .addChoice("Minecraft Bedrock Edition", "minecraftbe")
                )
            )
            .addSubcommand((sub) =>
              sub
                .setName("remove")
                .setDescription("Remove a server from the tracking list")
                .addStringOption((opt) =>
                  opt
                    .setName("name")
                    .setRequired(true)
                    .setDescription(
                      "The name of the server to remove from the tracking list"
                    )
                )
            )
            .addSubcommand((sub) =>
              sub
                .setName("list")
                .setDescription("List all servers in the tracking list")
            ),
        {
          behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
        }
      );
  }

  /*private buildGameOptions(option: SlashCommandStringOption) {
    option
      .setName("game")
      .setRequired(true)
      .setDescription("The game the server is running on");

    for (const game of games) {
      option.addChoice(game.name, game.value);
    }

    return option;
  }*/
}
