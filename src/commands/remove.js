const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const cfg = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('Permanently remove a thread and its associated message. Staff only.'),
	async execute(interaction, client) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_THREADS)) {
			await interaction.reply({ content: cfg.noPermission, ephemeral: true });
			return "NO_PERMISSION";
		}

        if (interaction.channel.isThread()) {
            const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId(`destroy-${interaction.channel.id}`)
                    .setLabel('Yes, do as I say!')
                    .setStyle('DANGER'),
            );
            let m = await interaction.reply({ content: `You're about to permanently remove this thread and its associated message. This request will time out <t:${Math.round(new Date().getTime() / 1000) + 60}:R>. Continue?`, components: [row], ephemeral: true })
    
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
                    
                    console.log(`${interaction.user.tag} removed thread #${interaction.channel.name}.`);
                    await interaction.channel.delete({reason: `Thread removed by ${interaction.member.user.username}`});

                    try {
                        let mid = await client.channels.cache.get(interaction.channel.parentId).messages.fetch(interaction.channel.id)
                        await mid.delete({reason: `Message removed by ${interaction.member.user.tag}`});
                    } catch {
                        // Doesn't exist, do nothing.
                    }
                    return "OKAY";
                }

            return "OKAY";
            });
		} else {
        await interaction.deferReply({ ephemeral: true });

            var opt = new MessageSelectMenu()
                .setCustomId('select')
                .setPlaceholder('Select the threads to be removed.')
                .setMinValues(1)

            const fetched = await interaction.channel.threads.fetchActive({limit: 25});

            fetched.threads.forEach(async t => {

                opt.addOptions(
                    [
                        {
                            label: `Issue #${t.name}`,
                            description: `${t.messageCount} messages`,
                            value: `${t.id}`
                        }
                    ]
                )
            })
            
            if (opt.options.length == 0) {
                await interaction.editReply('No active issues found.')
                return "OKAY";
            }
            
            let row = new MessageActionRow().addComponents(opt);

            let m = await interaction.editReply( { content: 'This tool will allow you to permanently delete multiple issues and their associated messages in one action. Please be careful, as it will run as soon as the drop-down is closed.\n\n', components: [row] } )

            const filter = m => m.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async m => {
                if (m.customId === "select") {
                    console.log(`${interaction.user.tag} in #${interaction.channel.name} ran a batch purge.`);

                    opt.setPlaceholder('Working...')
                    opt.setDisabled(true);
                    await m.update({components: [row], ephemeral: true });

                    m.values.forEach(async m => {
                        let thread = client.channels.cache.get(m)
                        if (thread) {
                            console.log(`${interaction.user.tag} removed thread #${thread.name}.`);
                            await thread.delete({reason: `Thread removed by ${interaction.member.user.username}`}
                        )};
                    })

                    interaction.editReply( { content: `Operation completed successfully.`, components: [] } )
                    return "OKAY";
                }
            })

            return "OKAY";
    }
	},
};