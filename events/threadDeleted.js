const cfg = require('../config.json');

module.exports = {
	name: 'threadDelete',
	async execute(thread, client, db) {
        if (thread.parentId == cfg.suggestionChannel || thread.parentId == cfg.bugChannel) {
            db.all(`SELECT bookmark_id FROM 'issues' WHERE thread_id = '${thread.id}'`, [], async (err, rows) => {
                if (rows[0].bookmark_id !== null) {
                    await thread.guild.channels.cache.get(cfg.saveChannel).messages.fetch(rows[0].bookmark_id)
                        .then(m => {
                            m.delete()
                        })

                        .catch(err => {
                            console.log(err)
                        })
                }
            })

            db.exec(`DELETE FROM 'issues' where thread_id = ${thread.id}`, async (err) => {
                console.log(`Dropped #${thread.name} from the database (deleted)`)
            })
        }
    }
}