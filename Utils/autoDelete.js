export async function replyAndDelete(interaction, content) {
  const reply = await interaction.reply({ content, ephemeral: false }); // always non-ephemeral
  setTimeout(async () => {
    try {
      const msg = await interaction.fetchReply();
      if (msg.deletable) await msg.delete();
    } catch {}
  }, 60000); // delete after 60 seconds
}
