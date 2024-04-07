require("dotenv").config();
import { ExtendedClient } from "./structures/Client";
import { CommandInteraction } from "discord.js";

export const client = new ExtendedClient();

client.start();

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return; // Only handle command interactions

    // Extract the user ID of the interaction's author
    const userId = interaction.user.id;
    console.log(`User ID of the interaction author: ${userId}`);

    // Now you can use the userId as needed, such as logging it or storing it in your database
});

const test = async (client: ExtendedClient) => {
    const res = await client.db.user.findMany({})
    client.logger.raw.debug(res);
}
