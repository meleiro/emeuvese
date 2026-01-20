const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController")
console.log("taskController keys:", Object.keys(taskController));
console.log("renderTasksPage type:", typeof taskController.renderTasksPage);

router.get("/tasks", taskController.renderTasksPage);
router.post("/tasks", taskController.createFromForm);
router.post("/tasks/:id/toggle", taskController.toggleDoneFromForm);
router.post("/tasks/:id/edit", taskController.updateTitleFromForm);
router.post("/tasks/:id/delete", taskController.deleteFromForm);

module.exports = router;