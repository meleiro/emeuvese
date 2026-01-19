const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController")

router.get("/tasks", taskController.renderTaskPages);
router.post("/tasks", taskController.createFromForm);
router.post("/tasks/:id/toggle", taskController.toggleDoneFromForm);
router.post("/tasks/:id/edit", taskController.updateTitleFromForm);
router.post("/tasks/:id/delete", taskController.deleteFromForm);

module.exports = router;