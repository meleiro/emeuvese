const Task = require("../models/task");

// RENDER: leer (READ)
exports.renderTasksPage = async (req, res) => {
  const tasks = await Task.findAll({ order: [["id", "DESC"]] });
  res.render("tasks", { tasks });
};

exports.createFromForm = async (req, res) => {

  const title = (req.body.title || "").trim();

  if (!title) return res.redirect("/tasks");

  await Task.create({ title });

  res.redirect("/tasks");

};

exports.toggleDoneFromForm = async (req, res) => {

  const { id } = req.params;

  const task = await Task.findByPk(id);

  if (!task) return res.redirect("/task");

  task.done = !task.done;

  await task.save();

  res.redirect("/task");


};

exports.updateTitleFromForm = async (req,res) => {

   const { id } = req.params;

   const title = (req.body.title || "").trim();

   if (!title) return res.redirect("/tasks");

   await Task.update(
      { title },
      { where: {id} }

   );

   res.redirect("/task");

}

exports.deleteFromForm = async (req, res) => {
  
  const { id } = req.params;

  await Task.destroy({
    where: { id }
  });

  res.redirect("/task");

}
