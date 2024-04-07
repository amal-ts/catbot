import { Command } from "../../structures/Command";
import axios from "axios";
import { PrismaClient } from "@prisma/client";

// Define a custom type for the `data` property of the response from the cat fact API
type CatFactResponseData = {
  fact: string;
};

// Define a custom type for the `user` property of the `interactionHistory` table in the Prisma database
type User = {
  id: bigint;
};

// Define a custom type for the `data` property of the `create` method of the `connectOrCreate` method of the `user` property of the `interactionHistory` table in the Prisma database
type CreateUserData = {
  id: bigint;
};

export default new Command({
  name: "catfact",
  description: "replies with a random cat fact",
  run: async ({ interaction }) => {
    try {
      const userId = BigInt(interaction.user.id);

      // Define the type of the response from the cat fact API
      const response = await axios.get<CatFactResponseData>("https://catfact.ninja/fact");

      if (response.status === 200) {
        const { fact } = response.data;

        const prisma = new PrismaClient();

        // Define the type of the `create` method of the `connectOrCreate` method of the `user` property of the `interactionHistory` table in the Prisma database
        const userToCreate: CreateUserData = {
          id: userId,
        };

        // Define the type of the `where` property of the `connectOrCreate` method of the `user` property of the `interactionHistory` table in the Prisma database
        const userExists: User = {
          id: userId,
        };

        await prisma.interactionHistory.create({
          data: {
            history: fact,
            user: {
              connectOrCreate: {
                create: userToCreate,
                where: userExists,
              },
            },
          },
        });

        interaction.followUp(fact);
      } else {
        throw new Error("Failed to fetch cat fact");
      }
    } catch (error) {
      console.error("Error fetching cat fact:", error.message);
      interaction.followUp("Failed to fetch cat fact. Please try again later.");
    }
  },
});