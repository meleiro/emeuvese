// Importamos el modelo Task desde la carpeta models.
// - Este modelo representa la tabla "Tasks" en la base de datos.
// - A través de él usamos Sequelize para hacer operaciones CRUD.
const Task = require("../models/Task");

// ===============================
// RENDER: leer (READ)
// ===============================
// Este controlador se encarga de:
// - Leer todas las tareas de la base de datos
// - Pasarlas a la vista EJS "tasks"
// - Renderizar la página HTML con esas tareas
exports.renderTasksPage = async (req, res) => {

  // Task.findAll() obtiene todas las filas de la tabla Task.
  // order: [["id", "DESC"]]
  // - Ordena las tareas por id de forma descendente
  // - Las tareas más nuevas aparecen primero
  const tasks = await Task.findAll({
    order: [["id", "DESC"]]
  });

  // res.render():
  // - Renderiza la vista "tasks.ejs"
  // - Pasa el array tasks a la vista como variable
  // - En EJS se podrá usar <%= tasks %> o recorrerlas con forEach/map
  res.render("tasks", { tasks });
};

// ===============================
// CREATE: crear una tarea (CREATE)
// ===============================
exports.createFromForm = async (req, res) => {

  // req.body contiene los datos enviados desde el formulario HTML (POST)
  // req.body.title es el valor del input con name="title"
  //
  // (req.body.title || ""):
  // - Evita errores si title viene undefined
  //
  // .trim():
  // - Elimina espacios al principio y al final
  // - Evita guardar títulos vacíos o solo con espacios
  const title = (req.body.title || "").trim();

  // Si el título está vacío después del trim:
  // - No se crea la tarea
  // - Se redirige de nuevo a /tasks
  if (!title) return res.redirect("/tasks");

  // Task.create():
  // - Inserta una nueva fila en la base de datos
  // - Solo se guarda el campo title
  // - Otros campos (done, createdAt, etc.) usan valores por defecto
  await Task.create({ title });

  // Redirige al listado de tareas
  // - Fuerza una nueva petición GET /tasks
  // - Patrón Post/Redirect/Get (buena práctica)
  res.redirect("/tasks");
};

// ===============================
// UPDATE: cambiar estado done (UPDATE)
// ===============================
exports.toggleDoneFromForm = async (req, res) => {

  // req.params contiene los parámetros de la URL
  // Si la ruta es /tasks/:id/toggle, aquí leemos ese :id
  const { id } = req.params;

  // Task.findByPk(id):
  // - Busca una tarea por su clave primaria (primary key)
  // - Devuelve el objeto Task o null si no existe
  const task = await Task.findByPk(id);

  // Si la tarea no existe:
  // - Redirigimos al listado
  // - Evitamos errores al intentar modificar algo inexistente
  if (!task) return res.redirect("/task");

  // Invertimos el valor de done
  // - Si estaba false → pasa a true
  // - Si estaba true → pasa a false
  task.done = !task.done;

  // task.save():
  // - Guarda los cambios del objeto en la base de datos
  await task.save();

  // Volvemos al listado de tareas
  res.redirect("/tasks");
};

// ===============================
// UPDATE: actualizar el título (UPDATE)
// ===============================
exports.updateTitleFromForm = async (req, res) => {

  // Obtenemos el id desde la URL
  const { id } = req.params;

  // Leemos y limpiamos el nuevo título desde el formulario
  const title = (req.body.title || "").trim();

  // Si el título está vacío, no actualizamos nada
  if (!title) return res.redirect("/tasks");

  // Task.update():
  // - Actualiza uno o varios registros
  // - Primer objeto: campos a actualizar
  // - Segundo objeto: condición WHERE
  await Task.update(
    { title },
    { where: { id } }
  );

  // Redirigimos al listado
  res.redirect("/tasks");
};

// ===============================
// DELETE: eliminar una tarea (DELETE)
// ===============================
exports.deleteFromForm = async (req, res) => {

  // Obtenemos el id de la tarea a borrar desde la URL
  const { id } = req.params;

  // Task.destroy():
  // - Elimina registros de la base de datos
  // - where: { id } indica qué fila borrar
  await Task.destroy({
    where: { id }
  });

  // Redirigimos al listado tras borrar
  res.redirect("/tasks");
};
