const { SlashCommandBuilder } = require('@discordjs/builders');
const cfg = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('save')
		.setDescription('Bookmark this thread and its associated message.'),
	async execute(interaction, client) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_THREADS)) {
			await interaction.reply({ content: cfg.noPermission, ephemeral: true });
			return "NO_PERMISSION";
		}
        if (interaction.channel.type !== "GUILD_PUBLIC_THREAD") {
			await interaction.reply({ content: cfg.notAThread, ephemeral: true });
			return "NOT_A_THREAD";
		}

        await interaction.deferReply({ ephemeral: true });
		return "OKAY";
	},
};