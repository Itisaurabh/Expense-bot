import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import { replyAndDelete } from "../utils/autoDelete.js";

const pointsFile = "./data/points.json";

export default {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Show top 5 users by points"),

  async execute(interaction) {
    let points = {};
    if (fs.existsSync(pointsFile)) {
      points = JSON.parse(fs.readFileSync(pointsFile, "utf8"));
    }

    const sorted = Object.entries(points)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (sorted.length === 0) {
      return replyAndDelete(
        interaction,
        "📭 No points data available yet.",
        true,
      );
    }

    const leaderboard = sorted
      .map(
        ([user, pts], index) => `\`${index + 1}.\` **${user}** - ${pts} points`,
      )
      .join("\n");

    await replyAndDelete(
      interaction,
      `🏆 **Leaderboard**\n\n${leaderboard}`,
      true,
    );
  },
};
