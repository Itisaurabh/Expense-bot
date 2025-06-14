import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import { replyAndDelete } from '../utils/autoDelete.js';

export default {
  data: new SlashCommandBuilder()
    .setName("category")
    .setDescription("Show expenses by category")
    .addStringOption((opt) =>
      opt
        .setName("name")
        .setDescription("Category name (e.g. food)")
        .setRequired(true),
    ),

  async execute(interaction) {
    const category = interaction.options.getString("name").toLowerCase();
    const data = JSON.parse(fs.readFileSync("./data/expenses.json", "utf8"));
    const filtered = data.filter((e) => e.category === category);

    if (!filtered.length) {
      return interaction.reply(`📭 No expenses found for **${category}**.`);
    }

    const total = filtered.reduce((sum, e) => sum + e.amount, 0);
    const recent = filtered
      .slice(-10)
      .map(
        (e) => `• ₹${e.amount} – ${e.user} (${e.note || "no note"}) [${e.id}]`,
      )
      .join("\n");

    await interaction.reply(
      `🔍 **Category:** ${category}\n💸 **Total:** ₹${total}\n\n${recent}`,
    );
  },
};
