import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import { replyAndDelete } from "../utils/autoDelete.js";

const pointsFile = "./data/points.json";

export default {
  data: new SlashCommandBuilder()
    .setName("points")
    .setDescription("Show your gamification points"),

  async execute(interaction) {
    const username = interaction.user.username;

    let points = {};
    if (fs.existsSync(pointsFile)) {
      points = JSON.parse(fs.readFileSync(pointsFile, "utf8"));
    }

    const userPoints = points[username] || 0;

    await replyAndDelete(
      interaction,
      `⭐ You have ${userPoints} points. Keep logging expenses to earn more!`,
      true,
    );
  },
};
