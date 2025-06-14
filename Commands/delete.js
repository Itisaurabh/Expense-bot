import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";
import { replyAndDelete } from "../utils/autoDelete.js";

const MAX_DELETE = 10;
const expensesFile = "./data/expenses.json";

function parseInput(input) {
  input = input.trim().toLowerCase();

  if (/^[a-z0-9]{6}$/.test(input)) return { type: "id", value: input };
  if (/^\d+$/.test(input)) return { type: "count", value: parseInt(input) };
  if (/^(\d+)h$/.test(input)) {
    const hrs = parseInt(input.match(/^(\d+)h$/)[1]);
    return { type: "hours", value: hrs };
  }
  const match = input.match(/^(last|recent)\s+(\d+)$/);
  if (match) {
    return { type: "count", value: parseInt(match[2]) };
  }
  return null;
}

export default {
  data: new SlashCommandBuilder()
    .setName("delete")
    .setDescription("Delete expenses flexibly by ID, count, or hours")
    .addStringOption((opt) =>
      opt
        .setName("input")
        .setDescription(
          'Expense ID, number to delete, or hours (e.g. "abc123", "5", "4h", "last 3")',
        )
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const input = interaction.options.getString("input");
    const parsed = parseInput(input);

    if (!parsed) {
      return replyAndDelete(
        interaction,
        '❌ Could not understand your input. Use an ID, number, or hours (e.g. "abcd12", "5", "4h")',
        true,
      );
    }

    let data = [];
    if (fs.existsSync(expensesFile)) {
      data = JSON.parse(fs.readFileSync(expensesFile, "utf8"));
    }

    if (parsed.type === "id") {
      const index = data.findIndex((e) => e.id === parsed.value);
      if (index === -1) {
        return replyAndDelete(
          interaction,
          `❌ No expense found with ID: ${parsed.value}`,
          true,
        );
      }
      const [removed] = data.splice(index, 1);
      fs.writeFileSync(expensesFile, JSON.stringify(data, null, 2));
      return replyAndDelete(
        interaction,
        `🗑️ Deleted expense ₹${removed.amount} for ${removed.category} [${parsed.value}]`,
        true,
      );
    }

    if (parsed.type === "count") {
      const count = parsed.value;
      if (count < 1 || count > MAX_DELETE) {
        return replyAndDelete(
          interaction,
          `❌ Count must be between 1 and ${MAX_DELETE}`,
          true,
        );
      }
      const removedItems = data.splice(-count, count);
      if (removedItems.length === 0) {
        return replyAndDelete(interaction, `❌ No expenses to delete.`, true);
      }
      fs.writeFileSync(expensesFile, JSON.stringify(data, null, 2));
      const totalAmount = removedItems.reduce((sum, e) => sum + e.amount, 0);
      return replyAndDelete(
        interaction,
        `🗑️ Deleted last ${removedItems.length} expenses totaling ₹${totalAmount}`,
        true,
      );
    }

    if (parsed.type === "hours") {
      const hours = parsed.value;
      if (hours < 1) {
        return replyAndDelete(
          interaction,
          `❌ Hours must be at least 1.`,
          true,
        );
      }
      const cutoff = Date.now() - hours * 3600 * 1000;
      const toRemove = data.filter(
        (e) => new Date(e.timestamp).getTime() >= cutoff,
      );
      if (toRemove.length === 0) {
        return replyAndDelete(
          interaction,
          `❌ No expenses found in the last ${hours} hours.`,
          true,
        );
      }
      data = data.filter((e) => new Date(e.timestamp).getTime() < cutoff);
      fs.writeFileSync(expensesFile, JSON.stringify(data, null, 2));
      const totalAmount = toRemove.reduce((sum, e) => sum + e.amount, 0);
      return replyAndDelete(
        interaction,
        `🗑️ Deleted ${toRemove.length} expenses totaling ₹${totalAmount} from the last ${hours} hours`,
        true,
      );
    }
  },
};
