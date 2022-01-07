const { SlashCommandBuilder } = require('@discordjs/builders');
const cfg = require('../config.json');
const { MessageEmbed, Permissions, MessageActionRow, MessageButton } = require('discord.js');

async function createBookmark(threadId, type, client) {

    let t = await client.channels.cache.get(threadId)
    let m = await client.channels.cache.get(t.parentId).messages.fetch(threadId)

    let savedThread = new MessageEmbed()
        .setColor((type == "SUGGESTION" ? '#5865F2' : type == "BUG" ? '#ED4245' : ""))
        .setAuthor({ name: `${m.author.username}#${m.author.discriminator}`, iconURL: m.author.avatarURL })
        .setTitle((type == "SUGGESTION" ? 'Suggestion' : type == "BUG" ? 'Bug Report' : "") +  ` | ${t.name}`)
        .setDescription(m.content)

    let row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setLabel('Jump to thread')
                .setURL(`https://discord.com/channels/${cfg.guildId}/${threadId}/`)
                .setStyle('LINK'),
        );

    await client.channels.cache.get(cfg.saveChannel).send({ embeds: [savedThread], components: [row] });
    return "OKAY";
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('save')
		.setDescription('Bookmark a suggestion or bug report.'),
	async execute(interaction, client) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_THREADS)) {
			await interaction.reply({ content: cfg.noPermission, ephemeral: true });
			return "NO_PERMISSION";
		}

        if (interaction.channel.type == "GUILD_PUBLIC_THREAD") {
			await interaction.deferReply({ ephemeral: true });

            switch (interaction.channel.parentId) {
                case cfg.suggestionChannel:
                    await createBookmark(interaction.channel.id, "SUGGESTION", client)
                    await interaction.editReply("Saved.")
                    return;

                case cfg.bugChannel:
                    await createBookmark(interaction.channel.id, "BUG", client)
                    await interaction.editReply("Saved.")
                    return;
            }
			return "OKAY";
		}
		return "OKAY";
	},
};
