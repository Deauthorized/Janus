const cfg = require('../config.json');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
	name: 'threadUpdate',
	async execute(thread, client, nothing, db) {
        if (thread.parentId == cfg.suggestionChannel || thread.channelId == cfg.parentId) {
            let t = await thread.guild.channels.cache.get(thread.id)
            let type = (thread.parentId == cfg.suggestionChannel ? "SUGGESTION" : thread.channelId == cfg.parentId ? "BUG" : "")
            db.all(`SELECT bookmark_id FROM 'issues' WHERE thread_id = '${t.id}'`, async(err, rows) => {
                if (rows[0].bookmark_id !== null) {
                    await thread.guild.channels.cache.get(cfg.saveChannel).messages.fetch(rows[0].bookmark_id)
                        .then(m => {
                            let nEmb = new MessageEmbed(m.embeds[0])
                                    .setTitle((type == "SUGGESTION" ? 'Suggestion' : type == "BUG" ? 'Bug Report' : "") +  `: \`${t.name}\``)
                                    .setColor((t.archived ? "#5C5C5C" : type == "SUGGESTION" ? '#5865F2' : type == "BUG" ? '#ED4245' : ""))
                                    .setFields(
                                        { name: 'Thread Status', value: `${t.archived ? `:file_cabinet:` : `:speaking_head:`}`, inline: true },
                                        { name: 'Upvotes', value: '0', inline: true },
                                        { name: 'Downvotes', value: '0', inline: true },
                                    )

                            m.edit({embeds: [nEmb]})                        
                        })

                        .catch( error => {
                            console.log(error);
                            //I guess someone decided it would be a good idea to delete the bookmark message MANUALLY FUCK FUCK YOU
                            db.run('UPDATE issues SET bookmark_id = ? WHERE thread_id = ?', [null, t.id], async(err) => {
                                if (err){console.log(err)}
                                await thread.guild.channels.cache.get(cfg.saveChannel).send(`**Developer Note:** Please use /save in the bookmarked thread or click the 'Remove Bookmark' button *instead* of deleting the bookmark yourself. It causes weird issues to happen, and I don't really like it :( \n\nIf you didn't meant to, don't worry, I've already purged the now late bookmark message from my database. \n**Offending thread:** <#${t.id}>`)
                            })}
                        )

                }
            })
        }
    }
}