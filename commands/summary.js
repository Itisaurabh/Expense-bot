import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import { replyAndDelete } from "../utils/autoDelete.js";

export default {
  data: new SlashCommandBuilder()
    .setName("summary")
    .setDescription("See overall expense summary"),

  async execute(interaction) {
    const data = JSON.parse(fs.readFileSync("./data/expenses.json", "utf8"));

    if (!data.length) {
      return replyAndDelete(interaction, "📭 No expenses logged yet.");
    }

    const total = data.reduce((sum, e) => sum + e.amount, 0);
    const byCategory = {};

    data.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    const breakdown = Object.entries(byCategory)
      .map(([cat, amt]) => `• ${cat}: ₹${amt}`)
      .join("\n");

    const allEntries = data
      .map(
        (e) =>
          `• ₹${e.amount} - ${e.category} by ${e.user} (${e.note || "no note"}) [${e.id}]`,
      )
      .join("\n");

    const msg = `📊 **Total Spent:** ₹${total}\n\n🔍 **By Category:**\n${breakdown}\n\n🧾 **All Expenses:**\n${allEntries}`;

    await replyAndDelete(interaction, msg);
  },
};
