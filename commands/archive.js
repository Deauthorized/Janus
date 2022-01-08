const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const cfg = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('archive')
		.setDescription('Mark a suggestion or bug report as "resolved" and archive the thread. Staff only.')
		.addStringOption(option => option.setName('reason').setDescription('Reason for closing this thread. Will be publically shown.'))
		.addBooleanOption(option => option.setName('lock').setDescription('Prevent non-administrators from re-opening this thread. Defaults to "False".')),
	async execute(interaction) {
		if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_THREADS)) {
			await interaction.reply({ content: cfg.noPermission, ephemeral: true });
			return "NO_PERMISSION";
		}
		if (interaction.channel.type !== "GUILD_PUBLIC_THREAD") {
			await interaction.reply({ content: cfg.notAThread, ephemeral: true });
			return "NOT_A_THREAD";
		}
		if (interaction.channel.archived == true) {
			await interaction.reply({ content: 'This thread is already closed.', ephemeral: true });
			return "THREAD_ARCHIVED";
		}
		let lock = interaction.options.getBoolean('lock')

		await interaction.deferReply({ ephemeral: true });
		await interaction.channel.send((lock == true ? `:lock:` : "") + `:file_cabinet: **${interaction.member.user.tag}** archived this thread` + (interaction.options.getString('reason') ? ` for the following reason: \`${interaction.options.getString('reason')}\`` : ""))
		if (lock == true) {
			await interaction.channel.setLocked(lock);
		}
		await interaction.channel.setArchived(true);
		await interaction.editReply(`Thread archived.`);
		return "OKAY";
	},
};