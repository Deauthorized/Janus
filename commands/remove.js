const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const cfg = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('Remove a thread and its associated message. Staff only.'),
	async execute(interaction, client) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_THREADS)) {
			await interaction.reply({ content: cfg.noPermission, ephemeral: true });
			return "NO_PERMISSION";
		}

        if (interaction.channel.type == "GUILD_PUBLIC_THREAD") {
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
    
                    await interaction.channel.delete({reason: `Thread removed by ${interaction.member.user.username}`});
                    if (mid) {await mid.delete();}
                    return "OKAY";
                }
            });
		} else {
        await interaction.deferReply({ ephemeral: true });

            var opt = new MessageSelectMenu()
                .setCustomId('select')
                .setPlaceholder('Select the threads to be removed.')
                .setMinValues(1)

            const fetched = await client.channels.cache.get(interaction.channel.id).messages.fetch({limit: 25})

            fetched.forEach(m => {
                if (m.content.toLowerCase().startsWith("suggestion: ") || m.content.toLowerCase().startsWith("bug: ")) {
                    let lbl

                    if (client.channels.cache.get(m.id) == undefined) {lbl = "Thread not found"} else {lbl = client.channels.cache.get(m.id).name};

                    opt.addOptions(
                        [
                            {
                                label: lbl,
                                description: m.content.substring(0, 100),
                                value: `${m.id}`
                            }
                        ]
                    )
                }
            })
            
            if (opt.options.length == 0) {
                await interaction.editReply('No messages found.')
                return "OKAY";
            }
            
            let row = new MessageActionRow().addComponents(opt);

            let m = await interaction.editReply( { content: 'This tool will allow you to permanently delete multiple threads and their associated messages in one action. Please be careful.\n\n', components: [row] } )

            const filter = m => m.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async m => {
                if (m.customId === "select") {
                    opt.setPlaceholder('Working...')
                    opt.setDisabled(true);

                    await m.update({components: [row], ephemeral: true });
                    
                    m.values.forEach(async m => {
                        let thread = client.channels.cache.get(m)
                        let parentMsg = await interaction.channel.messages.fetch(m)

                        if (thread) {thread.delete({reason: `Thread removed by ${interaction.member.user.username}`})};
                        if (parentMsg) {parentMsg.delete()}
                    })
                
                    interaction.editReply( { content: `Done.`, components: [] } )
                    return "OKAY";
                }
            })

            return "OKAY";
    }
	},
};
