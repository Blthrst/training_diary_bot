const { Scenes } = require('telegraf')
const { DateTime } = require('luxon')

const { sequelize, User, Training, Exercise } = require('./database')


const trainingScene = new Scenes.BaseScene("trainingScene")
const statScene = new Scenes.BaseScene("statScene")

//========================================================================

trainingScene.enter(ctx => {

    ctx.reply("What type of training you'll choose?", {
        reply_markup:
        {
            inline_keyboard: [
                [{ text: "Arms", callback_data: "arms_training" }, { text: "Legs", callback_data: "legs_training" },
                { text: "Back", callback_data: "back_training" }],
                [{ text: "Core", callback_data: "core_training" }, { text: "Chest", callback_data: "chest_training" }]
            ]
        }
    })
})


trainingScene.action(/\w+/, ctx => {
    let type = null;

    switch (ctx.callbackQuery.data) {
        case "arms_training": type = "Arms"; break;
        case "legs_training": type = "Legs"; break;
        case "core_training": type = "Core"; break;
        case "back_training": type = "Back"; break;
        case "chest_training": type = "Chest"; break;
    }

    User.findAll({ where: { id: ctx.from.id } })
        .then(users => {
            if (users.length == 0) {
                User.create({ id: ctx.from.id })
                    .then(user => {



                        user.createTraining({ userId: ctx.from.id, description: type, date: DateTime.now().toLocaleString(DateTime.DATE_FULL) })
                            .then(async (training) => {
                                console.log(training)
                                await ctx.replyWithHTML("Enter info about your exercise using this format: <i>name_of_exercise amount_of_repeats weight(if have)</i>\n\n<b>Click the button below to stop adding exercises</b>",
                                    {
                                        reply_markup:
                                        {
                                            keyboard: [
                                                ["Done"]
                                            ],
                                            resize_keyboard: true
                                        }
                                    })

                                trainingScene.on("message", async ctx => {

                                    if (ctx.message.text === "Done") {
                                        training.getExercises()
                                            .then(exercises => {
                                                const arr = exercises.map(item => {
                                                    return `${item.TrainingId} ${item.exercise} ${item.repeats} times ${item.weight ?? "no weight"}`
                                                })

                                                ctx.reply(arr.join('\n'))
                                            })
                                        ctx.scene.leave()
                                    }
                                    else {
                                        const arr = ctx.message.text.split(" ")

                                        switch (arr.length) {
                                            case 2: training.createExercise({ exercise: arr[0], repeats: arr[1], weight: null })
                                                .then(() => {
                                                    ctx.reply("Has been added")
                                                }); break;
                                            case 3: training.createExercise({ exercise: arr[0], repeats: arr[1], weight: arr[2] }); break;
                                            default: ctx.reply("Incorrect!")
                                        }
                                    }
                                })

                            })
                    })
            }
            else {
                const [user] = users
                user.createTraining({ userId: ctx.from.id, description: type, date: DateTime.now().toLocaleString(DateTime.DATE_FULL) })
                    .then(async (training) => {
                        console.log(training)
                        await ctx.replyWithHTML(`Enter info about your exercise using this format: <i>name_of_exercise amount_of_repeats weight(if have)</i>
                                                        <b>Click the button below to stop adding exercises</b>`,
                            {
                                reply_markup:
                                {
                                    keyboard: [
                                        ["Done"]
                                    ],
                                    resize_keyboard: true
                                }
                            })

                        trainingScene.on("message", async ctx => {

                            if (ctx.message.text === "Done") {
                                training.getExercises()
                                    .then(exercises => {
                                        const arr = exercises.map(item => {
                                            return `${item.TrainingId} ${item.exercise} ${item.repeats} times ${item.weight ?? "no weight"}`
                                        })

                                        ctx.reply(arr.join('\n'))
                                    })
                                ctx.scene.leave()
                            }
                            else {
                                const arr = ctx.message.text.split(" ")

                                switch (arr.length) {
                                    case 2: training.createExercise({ exercise: arr[0], repeats: arr[1], weight: null })
                                        .then(() => {
                                            ctx.reply("Has been added")
                                        }); break;
                                    case 3: training.createExercise({ exercise: arr[0], repeats: arr[1], weight: arr[2] }); break;
                                    default: ctx.reply("Incorrect!")
                                }
                            }
                        })

                    })
            }
        })
        .catch(err => ctx.reply(JSON.stringify(err)))


})


//=======================================================================

statScene.enter(async ctx => {
    const res = []

    const user = await User.findByPk(ctx.from.id)
    if (user != null) 
    {
        const trainings = await user.getTrainings()
        console.log("user != null")
        if (trainings != null) 
        {
            console.log("trainings != null")
            trainings.forEach(async tr => {
                const exercises = await tr.getExercises()
                console.log(exercises)
                res.push({title: tr.description, date: tr.date, arrayOfExercises: exercises})
                console.log(res)
            });
        }

        res.forEach(elem =>
            {
                ctx.replyWithHTML(`${elem.title} \n ${elem.date} \n\n ${elem.arrayOfExercises.join('\n')}`)
            })
    }
})

//========================================================================

module.exports = { trainingScene, statScene }
