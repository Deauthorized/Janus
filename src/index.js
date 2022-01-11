const fs = require('fs');
const path = require('path');
const { Client, Collection, Intents, Permissions } = require('discord.js');
const cfg = require('../config.json');
const sqlite3 = require('sqlite3');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const commandFiles = fs.readdirSync(path.resolve(__dirname, 'commands')).filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync(path.resolve(__dirname, 'events')).filter(file => file.endsWith('.js'));

client.commands = new Collection();

let db = new sqlite3.Database('./db/data.sqlite', (err) => {
    if (err) {
      console.error(err.message);
    }
    const init = 'CREATE TABLE IF NOT EXISTS issues (id, type, user_id, thread_id, created_at, upvotes, downvotes, bookmark_id)'
    db.exec(init);
});

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
    console.log(`Loaded command: ${command.data.name}`)
}

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
    console.log(`Registered event: ${file}`)
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client, db));
	}
}

client.on("error", (error) => {
    console.error(`The connection to Discord was dropped.\n ${error}`);
});

client.on('reconnecting', () => {
    console.log("Connecting to Discord...")
});

client.on('ready', () => {
	console.log(`Connected to Discord! I am ${client.user.tag}.`);
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
        console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction. (${interaction})`);
		console.log(`Interaction returned: ` + await command.execute(interaction, client, db));
	} catch (error) {
		console.error(error);
        await interaction.editReply({ content: `Something has gone wrong. \n \`\`\`${error}\`\`\``, ephemeral: true });
	}
});

require(path.resolve(__dirname, 'cmdDeploy.js'))
client.login(cfg.token);