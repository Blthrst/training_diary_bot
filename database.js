const {Sequelize, DataTypes} = require('sequelize')

const sequelize = new Sequelize("diary.db", "admin", "12345",
{
    dialect: "sqlite",
    storage: __dirname + "/diary.db"
})
//========================================
const User = sequelize.define("User",
{
    id:
    {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    }
})
//========================================
const Training = sequelize.define("Training",
{
    id:
    {
        allowNull: true,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        field: "id"
    },
    description:
    {
        allowNull: false,
        type: DataTypes.STRING
    },
    date:
    {
        allowNull: false,
        type: DataTypes.STRING
    }
})
//========================================
const Exercise = sequelize.define("Exercise",
{
    id:
    {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        field: "id"
    },
    exercise:
    {
        allowNull: false,
        type: DataTypes.STRING
    },
    repeats:
    {
        allowNull: false,
        type: DataTypes.INTEGER
    },
    weight:
    {
        allowNull: true,
        type: DataTypes.STRING
    }
})
//========================================
User.hasMany(Training)
Training.hasMany(Exercise)
//========================================

User.sync()
.then(res => console.log(res))
.catch(err => console.log(err))

Training.sync({force: true})
.then(res => console.log(res))
.catch(err => console.log(err))

Exercise.sync({force: true})
.then(res => console.log(res))
.catch(err => console.log(err))

//========================================




module.exports = {
    User,
    Training,
    Exercise,
    sequelize
}