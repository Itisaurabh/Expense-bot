import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from "discord.js";
import fs from "fs";

const PAGE_SIZE = 5;

export default {
  data: new SlashCommandBuilder()
    .setName("mine")
    .setDescription("View your own expenses"),

  async execute(interaction) {
    const user = interaction.user.username;
    const data = JSON.parse(fs.readFileSync("./data/expenses.json", "utf8"));
    const myExpenses = data.filter((e) => e.user === user);

    if (myExpenses.length === 0) {
      return replyAndDelete(
        interaction,
        "📭 You haven’t logged any expenses yet.",
      );
    }

    const generatePage = (page) => {
      const start = page * PAGE_SIZE;
      const pageItems = myExpenses.slice(start, start + PAGE_SIZE);
      const lines = pageItems
        .map(
          (e) =>
            `• ₹${e.amount} – ${e.category} (${e.note || "no note"}) [${e.id}]`,
        )
        .join("\n");

      return `🧾 Page ${page + 1}/${Math.ceil(myExpenses.length / PAGE_SIZE)}:\n${lines}`;
    };

    let currentPage = 0;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("prev")
        .setLabel("⬅️ Prev")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("Next ➡️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(myExpenses.length <= PAGE_SIZE),
    );

    await interaction.reply({
      content: generatePage(currentPage),
      components: [row],
    });
    const message = await interaction.fetchReply();

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 2 * 60 * 1000,
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({
          content: "This is not your pagination control.",
          ephemeral: true,
        });
      }

      if (i.customId === "next") currentPage++;
      if (i.customId === "prev") currentPage--;

      const newRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("prev")
          .setLabel("⬅️ Prev")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === 0),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Next ➡️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(
            currentPage >= Math.ceil(myExpenses.length / PAGE_SIZE) - 1,
          ),
      );

      await i.update({
        content: generatePage(currentPage),
        components: [newRow],
      });
    });

    collector.on("end", async () => {
      const disabledRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("prev")
          .setLabel("⬅️ Prev")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Next ➡️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
      );
      if (!message.deleted)
        await message.edit({ components: [disabledRow] }).catch(() => {});
    });
  },
};
