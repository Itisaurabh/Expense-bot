import { SlashCommandBuilder } from "discord.js";
import { replyAndDelete } from "../utils/autoDelete.js";

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("List all available bot commands"),

  async execute(interaction) {
    const helpMessage = `
📘 **Expense Tracker Bot Commands**

Use these commands via slash \`/\`:

──────────────────────────────
**💰 Expense Logging**
• \`/log <amount> <category> [note]\`  
  Add a new expense

• \`/mine\`  
  View your logged expenses

• \`/user @name\`  
  View expenses logged by another user

──────────────────────────────
**📊 Reports & Export**
• \`/summary\`  
  Overall spending totals and breakdown

• \`/category <name>\`  
  View expenses filtered by category

• \`/csv\`  
  Export all expenses as a CSV file

──────────────────────────────
**🗑️ Management (Admin Only)**
• \`/clear <N>\`  
  Delete last N messages in channel

• \`/delete <input>\`  
  Delete expenses by ID, last N entries, or last X hours

──────────────────────────────
**🎯 Goals & Progress**
• \`/setgoal <amount>\`  
  Set your weekly spending goal

• \`/progress\`  
  View your spending progress vs goal

──────────────────────────────
**🏆 Gamification**
• \`/points\`  
  View your earned points

• \`/leaderboard\`  
  See top users by points

──────────────────────────────
`;

    await replyAndDelete(interaction, helpMessage);
  },
};
