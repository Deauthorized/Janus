const cfg = require('../config.json');

module.exports = {
	name: 'messageDelete',
	async execute(message, client) {
        if (message.channelId == cfg.suggestionChannel || message.channelId == cfg.bugChannel) {
            let t = await client.channels.cache.get(message.id)
            if (t == undefined) {return;}
            console.log(`${t.name} has been orphaned!`)

            switch (cfg.orphanedThreadAction) {
                case "none":
                    return;
                
                case "warn":
                    await t.send(":warning **" + cfg.orphanedThreadMsg + "**")
                    return;

                case "lock":
                    await t.send(`:lock::file_cabinet: **${client.user.tag}** archived this thread for the following reason: \`${cfg.orphanedThreadMsg}\``)
                    await t.setLocked(true);
                    await t.setArchived(true);
                    return;

                case "delete":
                    await t.delete()
                    return;

            }
        }
    }
}