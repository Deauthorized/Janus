const fs = require('fs');
const path = require('path');
const { Client, Collection, Intents, Permissions } = require('discord.js');
const cfg = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.commands = new Collection();
const commandFiles = fs.readdirSync(path.resolve(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
    console.log(`Loaded command: ${command.data.name}`)
}

async function startThread(message, type) {
    await message.startThread({
        name: `${type} (${require('crypto').randomBytes(5).toString("hex")})`,
        autoArchiveDuration: 1440,
        reason: `${type} created by ${message.author.username}`
    })
}

client.once('ready', () => {
	console.log('Connected to Discord! Listening.');
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (message.type == "THREAD_STARTER_MESSAGE" && message.author == client.user.id) message.delete();

    switch (message.channelId) {
        case cfg.suggestionChannel:
            if (message.content.toLowerCase().startsWith("suggestion: ")) {
                await startThread(message, "Suggestion");
                return;
            } else (!message.member.permissions.has(Permissions.FLAGS.MANAGE_THREADS)); {
                if (message.member.permissions.has(Permissions.FLAGS.MANAGE_THREADS)) {return;}

                let m = await message.reply("To create a suggestion, please prefix your message with `Suggestion:`")

                message.delete()
                setTimeout(() => m.delete(), 5000);

                return;
            }

        case cfg.bugChannel:
            if (message.content.toLowerCase().startsWith("bug: ")) {
                await startThread(message, "Bug Report");
                return;
            } else {
                if (message.member.permissions.has(Permissions.FLAGS.MANAGE_THREADS)) {return;}

                let m = await message.reply("To create a bug report, please prefix your message with `Bug:`")
                
                message.delete()
                setTimeout(() => m.delete(), 5000);

                return;
            }
    }
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
        console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction. (${interaction})`);
		console.log(`Interaction returned: ` + await command.execute(interaction, client));
	} catch (error) {
		console.log(error);
        if (interaction.replied) {
            await interaction.editReply({ content: `Something has gone wrong. \n \`\`\`${error}\`\`\``, ephemeral: true });
        } else {
            await interaction.reply({ content: `Something has gone wrong. \n \`\`\`${error}\`\`\``, ephemeral: true });
        }
	}
});

require(path.resolve(__dirname, 'cmdDeploy.js'))

client.login(cfg.token);