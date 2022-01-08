const cfg = require('../config.json');

async function startThread(message, type) {
    await message.startThread({
        name: `${type} (${require('crypto').randomBytes(5).toString("hex")})`,
        autoArchiveDuration: 1440,
        reason: `${type} created by ${message.author.username}`
    })
}

module.exports = {
	name: 'messageCreate',
	async execute(message) {
        if (message.author.bot) return;
        if (message.type == "THREAD_STARTER_MESSAGE" && message.author == client.user.id) message.delete();
    
        switch (message.channelId) {
            case cfg.suggestionChannel:
                if (message.content.toLowerCase().startsWith("suggestion: ")) {
                    await startThread(message, "Suggestion");
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
                    await startThread(message, "Bug Report");
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
