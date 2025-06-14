import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import { createObjectCsvWriter } from "csv-writer";
import { replyAndDelete } from "../utils/autoDelete.js";

export default {
  data: new SlashCommandBuilder()
    .setName("csv")
    .setDescription("Export all expenses to CSV"),

  async execute(interaction) {
    const data = JSON.parse(fs.readFileSync("./data/expenses.json", "utf8"));
    if (!data.length)
      return replyAndDelete(interaction, "📭 No expenses to export.");

    const csvWriter = createObjectCsvWriter({
      path: "./data/expenses_export.csv",
      header: [
        { id: "id", title: "ID" },
        { id: "user", title: "User" },
        { id: "amount", title: "Amount" },
        { id: "category", title: "Category" },
        { id: "note", title: "Note" },
        { id: "timestamp", title: "Timestamp" },
      ],
    });

    await csvWriter.writeRecords(data);

    await interaction.reply({
      content: "📎 Export complete!",
      files: ["./data/expenses_export.csv"],
      ephemeral: false,
    });

    setTimeout(async () => {
      try {
        const msg = await interaction.fetchReply();
        if (msg.deletable) await msg.delete();
      } catch {}
    }, 60000);
  },
};
