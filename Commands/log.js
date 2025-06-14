import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import { replyAndDelete } from "../utils/autoDelete.js";

const expensesFile = "./data/expenses.json";
const goalsFile = "./data/goals.json";

function getStartOfWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(now.setDate(diff));
  start.setHours(0, 0, 0, 0);
  return start;
}

export default {
  data: new SlashCommandBuilder()
    .setName("log")
    .setDescription("Log a new expense")
    .addIntegerOption((opt) =>
      opt.setName("amount").setDescription("Amount in INR").setRequired(true),
    )
    .addStringOption((opt) =>
      opt
        .setName("category")
        .setDescription("e.g., food, travel")
        .setRequired(true),
    )
    .addStringOption((opt) =>
      opt.setName("note").setDescription("Optional note").setRequired(false),
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");
    const category = interaction.options.getString("category").toLowerCase();
    const note = interaction.options.getString("note") || "";
    const user = interaction.user.username;
    const timestamp = new Date().toISOString();
    const id = Math.random().toString(36).substring(2, 8);

    const newExpense = { id, user, amount, category, note, timestamp };

    // Load existing expenses
    let data = [];
    if (fs.existsSync(expensesFile)) {
      const raw = fs.readFileSync(expensesFile);
      if (raw.length > 0) data = JSON.parse(raw);
    }

    // Calculate current week spending
    const startOfWeek = getStartOfWeek();
    const userWeeklyExpenses = data.filter(
      (e) => e.user === user && new Date(e.timestamp) >= startOfWeek,
    );
    const weeklyTotalBefore = userWeeklyExpenses.reduce(
      (sum, e) => sum + e.amount,
      0,
    );
    const weeklyTotalAfter = weeklyTotalBefore + amount;

    // Load goals
    let goals = {};
    if (fs.existsSync(goalsFile)) {
      goals = JSON.parse(fs.readFileSync(goalsFile, "utf8"));
    }
    const goal = goals[user];

    data.push(newExpense);
    fs.writeFileSync(expensesFile, JSON.stringify(data, null, 2));

    // Add gamification points
    let points = {};
    const pointsFile = "./data/points.json";
    if (fs.existsSync(pointsFile)) {
      points = JSON.parse(fs.readFileSync(pointsFile, "utf8"));
    }
    points[user] = (points[user] || 0) + Math.floor(amount / 100);
    fs.writeFileSync(pointsFile, JSON.stringify(points, null, 2));

    const emojis = {
      food: "🍔",
      travel: "✈️",
      shopping: "🛍️",
      bills: "💡",
      other: "💸",
    };
    const emoji = emojis[category] || "💸";

    let warning = "";
    if (amount > 2000) {
      warning += `\n\n💀 **Whoa! That's a big one: ₹${amount}**`;
    }
    if (goal && weeklyTotalAfter >= goal * 0.8) {
      warning += `\n\n⚠️ You have used **${Math.round((weeklyTotalAfter / goal) * 100)}%** of your weekly goal ₹${goal}`;
    }

    await replyAndDelete(
      interaction,
      `✅ Logged ₹${amount} for **${category}** ${emoji}\n📝 ${note || "No note"}\n🆔 ID: \`${id}\`${warning}`,
    );
  },
};
