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
    }


});

module.exports = Task;