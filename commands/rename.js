const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rename')
		.setDescription('Set the thread name of a bug report or suggestion. Staff only.')
		.addStringOption(option => option.setName('name').setDescription('New name').setRequired(true)),
	async execute(interaction) {
		if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_THREADS)) {
			await interaction.reply({ content: 'You do not have permission to run this command.', ephemeral: true });
			return "NO_PERMISSION";
		}
		if (interaction.channel.type !== "GUILD_PUBLIC_THREAD") {
			await interaction.reply({ content: 'This command will only function in a thread.', ephemeral: true });
			return "NOT_A_THREAD";
		}
        await interaction.deferReply({ ephemeral: true });

        await interaction.channel.setName(interaction.options.getString('name'))
        if (!interaction.channel.archived) {
		    await interaction.channel.send(`:pencil: **${interaction.member.user.username}** set the name of this thread to: \`${interaction.options.getString('name')}\``)
        }

        await interaction.editReply(`Name set to: \`${interaction.options.getString('name')}\``);
		return "OKAY";
	},
};