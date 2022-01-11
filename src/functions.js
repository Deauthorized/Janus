"use strict";
const cfg = require('../config.json');
const { MessageEmbed, Permissions, MessageActionRow, MessageButton } = require('discord.js');

module.exports.startThread = async function startThread(message, type, db) {
    let tid = require('crypto').randomBytes(5).toString("hex")

    await message.startThread({
        name: `${type} (${tid})`,
        autoArchiveDuration: 1440,
        reason: `${type} created by ${message.author.username}`
    })
        .then((thread) => {
            db.run('INSERT INTO issues(id, type, user_id, thread_id, created_at, upvotes, downvotes) VALUES(?, ?, ?, ?, ?, ?, ?)', [tid, type, message.author.id, thread.id, Date.now(), "{}", "{}"], (err) => {
                if (err) {console.error(err)};
            })

            return;
        })
}

module.exports.createBookmark = async function createBookmark(threadId, type, client, db, interaction) {

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

module.exports.lockThread = async function lockThread(threadId) {
    
}