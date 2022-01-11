const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const cfg = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('name')
		.setDescription('Set the thread name of a suggestion or bug report. Staff only.')
		.addStringOption(option => option.setName('name').setDescription('New name').setRequired(true)),
	async execute(interaction) {
		if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_THREADS)) {
			await interaction.reply({ content: cfg.noPermission, ephemeral: true });
			return "NO_PERMISSION";
		}
		if (interaction.channel.type !== "GUILD_PUBLIC_THREAD") {
			await interaction.reply({ content: cfg.notAThread, ephemeral: true });
			return "NOT_A_THREAD";
		}
        await interaction.deferReply({ ephemeral: true });

        await interaction.channel.setName(interaction.options.getString('name'))
        if (!interaction.channel.archived) {
		    await interaction.channel.send(`:pencil: **${interaction.member.user.tag}** set the name of this thread to: \`${interaction.options.getString('name')}\``)
        }

        await interaction.editReply(`Name set to: \`${interaction.options.getString('name')}\``);
		return "OKAY";
	},
};