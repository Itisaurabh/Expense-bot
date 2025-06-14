import { REST, Routes } from "discord.js";
import "dotenv/config";

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

const deleteGlobals = async () => {
  const globalCommands = await rest.get(
    Routes.applicationCommands(process.env.CLIENT_ID),
  );
  console.log(`🧹 Found ${globalCommands.length} global commands.`);

  for (const cmd of globalCommands) {
    await rest.delete(Routes.applicationCommand(process.env.CLIENT_ID, cmd.id));
    console.log(`❌ Deleted global command: ${cmd.name}`);
  }
};

deleteGlobals();
const guildCommands = await rest.get(
  Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
);
for (const cmd of guildCommands) {
  await rest.delete(
    Routes.applicationGuildCommand(
      process.env.CLIENT_ID,
      process.env.GUILD_ID,
      cmd.id,
    ),
  );
  console.log(`🧹 Deleted guild command: ${cmd.name}`);
}
