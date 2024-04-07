import { CommandInteraction } from "discord.js";
import { PrismaClient } from "@prisma/client";
import { Command } from "../structures/Command";
import { ApplicationCommandOptionType } from "discord.js";

// Create a new instance of PrismaClient
const prisma = new PrismaClient();

export default new Command({
  name: "history",
  description: "Retrieves interaction history for a user",
  options: [
    {
      name: "user_id",
      description: "The ID of the user to retrieve history for",
      type: ApplicationCommandOptionType.String, // Set the type to String
      required: true, // Make the option required
    },
  ],
  run: async ({ interaction }) => {
    try {
      // Ensure interaction is a CommandInteraction
      if (!interaction.isCommand()) return;

      // Check if the interaction has already been replied to or deferred
      if (interaction.replied || interaction.deferred) return;

      // Defer the interaction reply
      await interaction.deferReply();

      // Extract the user ID from the interaction's options
      const userIdOption = interaction.options.get("user_id")?.value;

      // Check if user ID is provided
      if (!userIdOption) {
        return interaction.followUp("Please provide a user ID.");
      }

      // Retrieve interaction history from the database using Prisma
      const userHistory = await prisma.interactionHistory.findMany({
        where: {
          userId: BigInt(userIdOption), // Convert userIdOption to BigInt
        },
      });

      // Construct and send a message with the interaction history
      let historyMessage = `Interaction history for user ${userIdOption}:\n`;
      userHistory.forEach((historyEntry) => {
        historyMessage += `${historyEntry.history}\n`; // Assuming 'history' is the field containing the interaction history
      });

      // Reply to the interaction with the history message
      await interaction.followUp(historyMessage);
    } catch (error) {
      console.error("Error retrieving interaction history:", error);
      await interaction.followUp("Failed to retrieve interaction history. Please try again later.");
    }
  },
});
