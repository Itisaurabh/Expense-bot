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
    .setName("progress")
    .setDescription("Check your weekly spending vs goal"),

  async execute(interaction) {
    const username = interaction.user.username;
    const startOfWeek = getStartOfWeek();

    let data = [];
    if (fs.existsSync(expensesFile)) {
      data = JSON.parse(fs.readFileSync(expensesFile, "utf8"));
    }

    const weekly = data.filter(
      (e) => e.user === username && new Date(e.timestamp) >= startOfWeek,
    );

    const total = weekly.reduce((sum, e) => sum + e.amount, 0);

    let goals = {};
    if (fs.existsSync(goalsFile)) {
      goals = JSON.parse(fs.readFileSync(goalsFile, "utf8"));
    }

    const goal = goals[username];
    const percent = goal ? Math.round((total / goal) * 100) : null;

    let msg = `📊 This week, you’ve spent ₹${total}`;
    if (goal) {
      const remaining = goal - total;
      msg += `\n🎯 Goal: ₹${goal}\n⏳ Remaining: ₹${remaining > 0 ? remaining : 0}`;
    } else {
      msg += `\n❌ No goal set. Use \`/setgoal\` to define one.`;
    }

    await replyAndDelete(interaction, msg);
  },
};
