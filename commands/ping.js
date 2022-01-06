const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('How am I doing?'),
	async execute(interaction, client) {
		await interaction.reply(`\`${client.ws.ping.toString().substring(0, 6)} ms\`. Thank you for asking.`)
		return "OKAY";
	},
};