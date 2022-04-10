import { ApplicationCommandRegistry, Command, RegisterBehavior } from "@sapphire/framework";
import { WEATHER_KEY } from "../config";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { fetch } from "../lib/utils/fetch";
import { engToBos } from "../lib/utils/weatherstuff";
import type { SlashCommandBuilder } from "@discordjs/builders";


export default class WeatherCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: "weather",
            description: "Returns the weather for a given location."
        });
    }

    public async chatInputRun(interaction: CommandInteraction) {
        const location = interaction.options.getString("location", true);

        if(!location) {
            return interaction.reply({content: "Please provide a location.", ephemeral: true});
        }

        await interaction.deferReply({ephemeral: true});

        const weather = await this.getWeather(location);

        if(!weather) {
            return interaction.editReply({content: "Could not find weather for that location."});
        }

        const embed = new MessageEmbed()
        .setTitle(`Weather for ${weather.location.name} (${weather.location.country})`)
        .setAuthor({name: `Conditions: ${engToBos(weather.current.condition.code, weather.current.is_day)}`, iconURL: `https:${weather.current.condition.icon}`})
        .addField("Temperature", `${weather.current.temp_f}°F / ${weather.current.temp_c}°C\nFeels like: ${weather.current.feelslike_f}°F / ${weather.current.feelslike_c}°C`)
        .addField("Wind", `${weather.current.wind_mph} mph / ${weather.current.wind_kph} kph\nDirection: ${weather.current.wind_dir}`)
        .addField("Humidity", `${weather.current.humidity}%`)
        .addField("Time", `${weather.location.localtime}`)
        .addField("Precipitation", `${weather.current.precip_in} inches / ${weather.current.precip_mm} mm`)
        .setColor(weather.current.is_day ? "#0763f7" : "#001638")
        .setFooter({text: "Powered by Weather API"});

        return interaction.editReply({ embeds: [embed] });
    }

    public registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry //
			.registerChatInputCommand(
				(builder: SlashCommandBuilder) =>
					builder //
						.setName(this.name)
						.setDescription(this.description)
						.addStringOption(opt => opt.setName("location")
                        .setRequired(true)
                        .setDescription("The location to get the weather for.")),
				{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite, idHints: ["962447656347635732"] }
			);
    }

    private async getWeather(location: string) {
        const url = `http://api.weatherapi.com/v1/current.json?key=${WEATHER_KEY}&q=${location}`;
        const res = await fetch<WeatherResult>(url);
        return res
    }

}

interface WeatherResult {
    location: {
        name: string;
        region: string;
        country: string;
        lat: number;
        lon: number;
        localtime: string;
    };
    current: {	
        observation_time: string;
        temp_c: number;
        temp_f: number;
        is_day: boolean;
        condition: {
            text: string;
            icon: string;
            code: number;
        };
        wind_kph: number;
        wind_mph: number;
        wind_degree: number;
        wind_dir: string;
        feelslike_c: number;
        feelslike_f: number;
        cloud: number;
        humidity: number;
        pressure_mb: number;
        pressure_in: number;
        precip_mm: number;
        precip_in: number;
        gust_kph: number;
        gust_mph: number;
    }
}