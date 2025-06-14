import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Delete last N messages in this channel")
    .addIntegerOption((opt) =>
      opt
        .setName("count")
        .setDescription("Number of messages to delete")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const count = interaction.options.getInteger("count");
    const messages = await interaction.channel.messages.fetch({
      limit: count + 1,
    });

    await interaction.channel.bulkDelete(messages, true);
    await interaction.reply({
      content: `🧹 Deleted ${count} messages`,
      ephemeral: true,
    });
  },
};
