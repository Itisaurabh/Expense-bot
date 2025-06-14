import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import { replyAndDelete } from "../utils/autoDelete.js";

const goalsFile = "./data/goals.json";

export default {
  data: new SlashCommandBuilder()
    .setName("setgoal")
    .setDescription("Set your weekly spending goal in INR")
    .addIntegerOption((opt) =>
      opt.setName("amount").setDescription("Goal amount").setRequired(true),
    ),

  async execute(interaction) {
    const username = interaction.user.username;
    const amount = interaction.options.getInteger("amount");

    let goals = {};
    if (fs.existsSync(goalsFile)) {
      goals = JSON.parse(fs.readFileSync(goalsFile, "utf8"));
    }

    goals[username] = amount;
    fs.writeFileSync(goalsFile, JSON.stringify(goals, null, 2));

    await replyAndDelete(
      interaction,
      `🎯 Weekly goal set to ₹${amount} for ${username}`,
    );
  },
};
