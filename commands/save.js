const { SlashCommandBuilder } = require('@discordjs/builders');
const cfg = require('../config.json');
const { MessageEmbed, Permissions, MessageActionRow, MessageButton } = require('discord.js');

async function createBookmark(threadId, type, client) {

    switch (type) {
        case "SUGGESTION":

            let s = await client.channels.cache.get(cfg.suggestionChannel).messages.fetch(threadId)

            console.log(s)

            let bookmarkMessage = new MessageEmbed()
                .setColor("#5865F2")
                .setAuthor({ name: `${s.author.username}#${s.author.discriminator}`, iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
                .setTitle(`Suggestion: ${client.channels.cache.get(threadId).name}`)
                .setDescription(s.content)

            let row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setLabel('Jump to thread')
                    .setURL(`https://discord.com/channels/${cfg.guildId}/${threadId}/`)
                    .setStyle('LINK'),
            );

            await client.channels.cache.get(cfg.saveChannel).send({ embeds: [bookmarkMessage], components: [row] });
            return "OKAY";
    }

    return;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('save')
		.setDescription('Bookmark this thread and its associated message.'),
	async execute(interaction, client) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_THREADS)) {
			await interaction.reply({ content: cfg.noPermission, ephemeral: true });
			return "NO_PERMISSION";
		}

        if (interaction.channel.type == "GUILD_PUBLIC_THREAD") {
			await interaction.deferReply({ ephemeral: true });

            switch (interaction.channel.parentId) {
                case cfg.suggestionChannel:

                    console.log(interaction.channel)

                    await createBookmark(interaction.channel.id, "SUGGESTION", client)

                    await interaction.editReply("Saved.")
            }

            await createBookmark(interaction.channel.id)
			return "OKAY";
		}
		return "OKAY";
	},
};