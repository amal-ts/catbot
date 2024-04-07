import { CommandInteractionOptionResolver } from "discord.js";
import { client } from "..";
import { PrismaClient } from '@prisma/client';
import { Event } from "../structures/Event";
import { ExtendedInteraction } from "../typings/Command";

// Create a new instance of PrismaClient
const prisma = new PrismaClient();

export default new Event("interactionCreate", async (interaction) => {
    // Chat Input Commands
    if (interaction.isCommand()) {
        await interaction.deferReply();
        const command = client.commands.get(interaction.commandName);
        if (!command)
            return interaction.followUp("You have used a non-existent command");

        // Extract the user ID from the interaction
        const userId = interaction.user.id;

        // Save the user ID to the database using Prisma
        try {
            // Convert user ID from string to bigint
            const userIdBigInt = BigInt(interaction.user.id);
        
            // Try to find the user in the database
            let user = await prisma.user.findUnique({
                where: {
                    id: userIdBigInt,
                },
            });
        
            // If the user doesn't exist, create a new one
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        id: userIdBigInt,
                        // Other fields...
                    },
                });
                console.log(`User ID ${userIdBigInt} saved to the database.`);
            }
        } catch (error) {
            console.error("Error saving user ID to the database:", error);
        }
        

        // Run the command
        command.run({
            args: interaction.options as CommandInteractionOptionResolver,
            client,
            interaction: interaction as ExtendedInteraction,
            reply: function (arg0: string): unknown {
                throw new Error("Function not implemented.");
            },
            user: undefined
        });
    }
});
