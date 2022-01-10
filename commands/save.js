const { SlashCommandBuilder } = require('@discordjs/builders');
const cfg = require('../config.json');
const { MessageEmbed, Permissions, MessageActionRow, MessageButton } = require('discord.js');

async function createBookmark(threadId, type, client, db, interaction) {

    let t = await client.channels.cache.get(threadId)
    let m = await client.channels.cache.get(t.parentId).messages.fetch(threadId)

    let savedThread = new MessageEmbed()
        .setColor((type == "SUGGESTION" ? '#5865F2' : type == "BUG" ? '#ED4245' : ""))
        .setAuthor({ name: `${m.author.tag}`, iconURL: m.author.avatarURL })
        .setTitle((type == "SUGGESTION" ? 'Suggestion' : type == "BUG" ? 'Bug Report' : "") +  `: \`${t.name}\``)
        .setDescription(`${m.content.substring(m.content.indexOf(":") + 1)}`)
        .addFields(
            { name: 'Thread Status', value: ':speaking_head:', inline: true },
            { name: 'Upvotes', value: '0', inline: true },
            { name: 'Downvotes', value: '0', inline: true },
        )

    let row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setLabel('Jump to thread')
                .setURL(`https://discord.com/channels/${cfg.guildId}/${threadId}/`)
                .setStyle('LINK'),
        );

    let message = await client.channels.cache.get(cfg.saveChannel).send({ embeds: [savedThread], components: [row] });
    await db.run('UPDATE issues SET bookmark_id = ? WHERE thread_id = ?', [message.id, threadId], (err) => {
        if (err){console.log(err)}
    })

    let row2 = new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setLabel(`Jump`)
            .setURL(`https://discord.com/channels/${cfg.guildId}/${cfg.saveChannel}/${message.id}`)
            .setStyle('LINK'),
    );

    await interaction.editReply({content: `Bookmark created for <#${threadId}>`, components: [row2]})
    
    return message;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bookmark')
		.setDescription('Bookmark a suggestion or bug report.'),
	async execute(interaction, client, db) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_THREADS)) {
			await interaction.reply({ content: cfg.noPermission, ephemeral: true });
			return "NO_PERMISSION";
		}
        if (interaction.channel.type == "GUILD_PUBLIC_THREAD") {
			await interaction.deferReply({ ephemeral: true });

            db.all(`SELECT bookmark_id FROM 'issues' WHERE thread_id = '${interaction.channel.id}'`, [], async (err, rows) => {
                if (rows.length > 1) {
                    console.error("Query returned more than one result. This is indicative of a database issue.")
                    return;
                }

                if (rows[0].bookmark_id == null) {
                    switch (interaction.channel.parentId) {
                        case cfg.suggestionChannel:
                            await createBookmark(interaction.channel.id, "SUGGESTION", client, db, interaction)
                            return;
        
                        case cfg.bugChannel:
                            await createBookmark(interaction.channel.id, "BUG", client, db, interaction)
                            return;
                    }
                    return;
                } else 
                
                if (rows[0].bookmark_id !== null) {
                    await interaction.channel.guild.channels.cache.get(cfg.saveChannel).messages.fetch(rows[0].bookmark_id)
                        .then (msg => {
                            db.run('UPDATE issues SET bookmark_id = ? WHERE thread_id = ?', [null, interaction.channel.id], async(err) => {
                                if (err){console.log(err)}
                                msg.delete()
                                interaction.editReply("Bookmark removed.")
                            })
                        })

                        .catch(err => {
                            db.run('UPDATE issues SET bookmark_id = ? WHERE thread_id = ?', [null, interaction.channel.id], async(err) => {
                                if (err){console.log(err)}
                                interaction.editReply("Bookmark removed.")
                            })
                        })
                }


            })
			return "OKAY";
		}
        await interaction.deferReply({ ephemeral: true });

		return "OKAY";
	},
};