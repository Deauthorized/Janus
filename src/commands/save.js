const { SlashCommandBuilder } = require('@discordjs/builders');
const cfg = require('../../config.json');
const { MessageEmbed, Permissions, MessageActionRow, MessageButton } = require('discord.js');
const { createBookmark } = require('../functions.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bookmark')
		.setDescription('Bookmark a suggestion or bug report. Staff only.'),
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