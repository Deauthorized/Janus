const { SlashCommandBuilder } = require('@discordjs/builders');
const cfg = require('./config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('save')
		.setDescription('Bookmark this thread and its associated message.'),
	async execute(interaction, client) {
		await interaction.deferReply({ ephemeral: true });
        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_THREADS)) {
			await interaction.reply({ content: 'You do not have permission to run this command.', ephemeral: true });
			return "NO_PERMISSION";
		}
        if (interaction.channel.type !== "GUILD_PUBLIC_THREAD") {
			await interaction.reply({ content: 'This command will only function in a thread.', ephemeral: true });
			return "NOT_A_THREAD";
		}
		return "OKAY";
	},
};