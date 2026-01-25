const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); 

const Task = sequelize.define("Task", {

    title: {
        type: DataTypes.STRING,
        allowNull:false
    },
    done: {
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    priority: {
        type: DataTypes.STRING,
        allowNull:false,
        defaultValue:"media",
        validate: {
           isIn: [[ "baja", "media", "alta"] ] 
        }

    }, 
        timestamps: true
    });

module.exports = Task;