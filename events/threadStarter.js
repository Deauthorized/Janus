const cfg = require('../config.json');
const { Permissions } = require('discord.js');

async function startThread(message, type, db) {
    let tid = require('crypto').randomBytes(5).toString("hex")

    await message.startThread({
        name: `${type} (${tid})`,
        autoArchiveDuration: 1440,
        reason: `${type} created by ${message.author.username}`
    })
        .then((thread) => {
            console.log(`PUSH: ${tid}, ${type}, ${message.author.id}, ${thread.id}, ${Date.now()}, (), ()`)
            db.run('INSERT INTO issues(id, type, user_id, thread_id, created_at, upvotes, downvotes) VALUES(?, ?, ?, ?, ?, ?, ?)', [tid, type, message.author.id, thread.id, Date.now(), "{}", "{}"], (err) => {
                if (err) {console.error(err)};
            })

            return;
        })
};

module.exports = {
	name: 'messageCreate',
	async execute(message, client, db) {
        if (message.author.bot) return;
        if (message.type == "THREAD_STARTER_MESSAGE" && message.author == client.user.id) message.delete();
    
        switch (message.channelId) {
            case cfg.suggestionChannel:
                if (message.content.toLowerCase().startsWith("suggestion: ")) {
                    await startThread(message, "Suggestion", db);
                    console.log(`${message.author.username}#${message.author.discriminator} created a suggestion: ${message.content}`)
                    return;
                } else (!message.member.permissions.has(Permissions.FLAGS.MANAGE_THREADS)); {
                    if (message.member.permissions.has(Permissions.FLAGS.MANAGE_THREADS)) {return;}
    
                    let m = await message.reply("To create a suggestion, please start your message with `Suggestion:`")
                    setTimeout(() => m.channel.bulkDelete([m.id, message.id]), 10000);
    
                    return;
                }
    
            case cfg.bugChannel:
                if (message.content.toLowerCase().startsWith("bug: ")) {
                    await startThread(message, "Bug Report", db);
                    console.log(`${message.author.username}#${message.author.discriminator} created a bug report: ${message.content}`)
                    return;
                } else {
                    if (message.member.permissions.has(Permissions.FLAGS.MANAGE_THREADS)) {return;}
    
                    let m = await message.reply("To create a bug report, please start your message with `Bug:`")
                    setTimeout(() => m.channel.bulkDelete([m.id, message.id]), 10000);
    
                    return;
                }
        }
	},
};