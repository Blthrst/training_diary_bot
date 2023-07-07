const { Telegraf, session, Scenes } = require("telegraf")
const { trainingScene, statScene } = require('./scenes')
const { sequelize, User } = require('./database')
require('dotenv').config()

const bot = new Telegraf(process.env.BOT_TOKEN)
const stage = new Scenes.Stage([trainingScene, statScene])

bot.use(session())
bot.use(stage.middleware())

bot.start(ctx => {
    sequelize.authenticate()
        .then(() => { })
        .catch(err => {
            ctx.reply(JSON.stringify(err))
        })
        .finally( () =>
        {
            ctx.reply("Use keyboard", {
                reply_markup:
                {
                    keyboard:
                        [
                            ["Training"], ["Show my trainings"]
                        ],
                        resize_keyboard: true
                }
            })
        })
})


bot.on('message', ctx => {
    switch (ctx.message.text) {
        case "Training": ctx.scene.enter("trainingScene"); break;
        case "Show my trainings": ctx.scene.enter("statScene"); break;
        default: ctx.reply("Use buttons below"); break;
    }
})



bot.launch()