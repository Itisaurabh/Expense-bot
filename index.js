// Final index.js with ALL requested features implemented

import './keepalive.js';
import {
  Client,
  Collection,
  GatewayIntentBits,
  Events,
  Partials,
} from "discord.js";
import fs from "fs";
import path from "path";
import cron from "node-cron";
import "dotenv/config";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.commands = new Collection();

// Load slash commands
const commandsPath = "./commands";
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.default.data.name, command.default);
}

// Slash command interaction
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "❌ Error executing command.",
      ephemeral: true,
    });
  }
});

// Smart message logging (e.g., "100 food" or "food 100")
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim();
  const regex = /^([a-z]+)\s+(\d+)(.*)?$|^(\d+)\s+([a-z]+)(.*)?$/i;
  const match = content.match(regex);
  if (!match) return;

  const amount = parseInt(match[2] || match[4]);
  const category = (match[1] || match[5]).toLowerCase();
  const note = (match[3] || match[6])?.trim() || "";

  if (!amount || isNaN(amount) || !category) return;

  const user = message.author.username;
  const timestamp = new Date().toISOString();
  const id = Math.random().toString(36).substring(2, 8);
  const newExpense = { id, user, amount, category, note, timestamp };

  const filePath = "./data/expenses.json";
  let data = [];
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath);
    if (raw.length > 0) data = JSON.parse(raw);
  }
  data.push(newExpense);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  const emojiMap = {
    food: "🍔",
    travel: "✈️",
    shopping: "🛍️",
    bills: "💡",
    other: "💸",
  };
  const emoji = emojiMap[category] || "💸";

  const reply = await message.reply(
    `✅ Logged ₹${amount} for **${category}** ${emoji}\n📝 ${note || "No note"}\n🆔 ID: \`${id}\``,
  );
});

// Daily summary at 10 PM IST
cron.schedule(
  "30 16 * * *",
  async () => {
    const filePath = "./data/expenses.json";
    if (!fs.existsSync(filePath)) return;

    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (!data.length) return;

    const today = new Date().toISOString().split("T")[0];
    const todayLogs = data.filter((e) => e.timestamp.startsWith(today));
    if (!todayLogs.length) return;

    const total = todayLogs.reduce((sum, e) => sum + e.amount, 0);
    const byCategory = {};
    todayLogs.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    const top = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
    const msg = `📊 **Daily Summary (${today})**\nTotal Spent: ₹${total}\nTop Category: ${top ? `${top[0]} (₹${top[1]})` : "N/A"}`;

    try {
      const channel = await client.channels.fetch(
        process.env.SUMMARY_CHANNEL_ID,
      );
      if (channel) channel.send(msg);
    } catch (e) {
      console.error("Daily summary error:", e.message);
    }
  },
  {
    timezone: "Asia/Kolkata",
  },
);

client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
