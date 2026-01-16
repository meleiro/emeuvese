const Task = require("../models/task");

// RENDER: leer (READ)
exports.renderTasksPage = async (req, res) => {
  const tasks = await Task.findAll({ order: [["id", "DESC"]] });
  res.render("tasks", { tasks });
};
