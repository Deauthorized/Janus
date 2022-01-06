const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('Remove a thread and its associated message. Staff only.'),
	async execute(interaction, client) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_THREADS)) {
			await interaction.reply({ content: 'You do not have permission to run this command.', ephemeral: true });
			return "NO_PERMISSION";
		}
        if (interaction.channel.type !== "GUILD_PUBLIC_THREAD") {
			await interaction.reply({ content: 'This command will only function in a thread.', ephemeral: true });
			return "NOT_A_THREAD";
		}

        const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId(`destroy-${interaction.channel.id}`)
                .setLabel('Yes, do as I say!')
                .setStyle('DANGER'),
        );
        let m = await interaction.reply({ content: `You're about to permanently remove this thread and its parent message. This action will time-out <t:${Math.round(new Date().getTime() / 1000) + 60}:R>. Continue?`, components: [row], ephemeral: true })

        const filter = m => m.customId === `destroy-${interaction.channel.id}` && m.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });
        
        collector.on('collect', async m => {
            if (m.customId === `destroy-${interaction.channel.id}`) {

                let row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId(`destroy-${interaction.channel.id}`)
                        .setLabel('Removing...')
                        .setStyle('DANGER')
                        .setDisabled(true),
                );

                await m.update({components: [row], ephemeral: true });

                let mid = await client.channels.cache.get(interaction.channel.parentId).messages.fetch(interaction.channel.id)

                await interaction.channel.delete();
                if (mid) {await mid.delete();}
                return "OKAY";
            }
        });

		return "OKAY";
	},
};
