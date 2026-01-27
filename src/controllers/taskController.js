// ===============================
// IMPORTS / DEPENDENCIAS
// ===============================

// Importamos Sequelize (la librería ORM) para poder usar utilidades avanzadas.
// En este archivo lo necesitamos por un motivo concreto:
// - Sequelize.literal(...) nos permite escribir un trozo de SQL "a mano"
//   dentro del ORDER BY (por ejemplo, para ordenar prioridad con CASE).
const { Sequelize } = require("sequelize");

// Importamos el modelo Task.
// - El modelo representa la tabla de la base de datos.
// - A través de Task hacemos operaciones CRUD: findAll, create, update, destroy, etc.
const Task = require("../models/Task");

// ===============================
// RENDER: leer (READ)
// ===============================
// Este controlador:
// - Lee las tareas desde la base de datos
// - Aplica ordenación según la query string (sortBy, sortType)
// - Renderiza la vista EJS "tasks" pasando las tareas y los parámetros para mantener selects
exports.renderTasksPage = async (req, res) => {

  // Leemos parámetros de la URL (query string):
  // Ejemplo: /tasks?sortBy=priority&sortType=asc
  //
  // req.query.sortBy:
  // - "old" (ordenar por fecha)
  // - "priority" (ordenar por prioridad)
  //
  // Si el usuario no manda nada, usamos valores por defecto:
  const sortBy = req.query.sortBy || "old";     // old | priority
  const sortType = req.query.sortType || "asc"; // asc | des

  // 1) Convertimos el valor del formulario (asc / des) a lo que entiende Sequelize/SQL:
  // - "ASC"  -> orden ascendente
  // - "DESC" -> orden descendente
  //
  // OJO: tu select manda "des" (no "desc"), por eso hacemos esta conversión.
  const dir = sortType === "des" ? "DESC" : "ASC";

  // 2) Construimos el ORDER BY en la forma que espera Sequelize:
  // order es un array de criterios, por ejemplo:
  //   [["createdAt", "DESC"]]
  // o:
  //   [[Sequelize.literal("..."), "ASC"]]
  let order;

  // Si el usuario quiere ordenar por prioridad:
  if (sortBy === "priority") {

    // Ordenar prioridades "baja/media/alta" directamente alfabéticamente NO vale,
    // porque alfabéticamente sería: alta, baja, media (y eso no es "natural").
    //
    // Queremos un orden "lógico":
    // - baja  -> 1
    // - media -> 2
    // - alta  -> 3
    //
    // Para conseguirlo usamos un CASE en SQL.
    // Sequelize.literal(...) nos deja escribir ese fragmento SQL.
    //
    // El ORDER BY final quedará como:
    // ORDER BY (CASE priority WHEN 'alta' THEN 3 WHEN 'media' THEN 2 WHEN 'baja' THEN 1 ELSE 0 END) ASC/DESC
    order = [[
      Sequelize.literal(`
        CASE priority
          WHEN 'alta' THEN 3
          WHEN 'media' THEN 2
          WHEN 'baja' THEN 1
          ELSE 0
        END
      `),
      dir
    ]];

  } else {
    // Si sortBy NO es "priority", entonces usamos fecha de creación.
    // "createdAt" es una columna que Sequelize crea automáticamente si timestamps = true.
    //
    // Con dir:
    // - ASC  -> más antiguos primero
    // - DESC -> más nuevos primero
    order = [["createdAt", dir]];
  }

  // Consultamos la base de datos:
  // Task.findAll({ order })
  // - Trae todas las tareas
  // - Aplicando el order construido arriba
  const tasks = await Task.findAll({ order });

  // Renderizamos la vista "tasks.ejs":
  // - tasks: lista de tareas para mostrar
  // - sortBy y sortType: se envían a la vista para mantener seleccionados los <select>
  res.render("tasks", { tasks, sortBy, sortType });
};

// ===============================
// CREATE: crear una tarea (CREATE)
// ===============================
exports.createFromForm = async (req, res) => {

  // req.body contiene los datos enviados por el formulario (POST).
  // Para que esto funcione, en app.js debe existir:
  // app.use(express.urlencoded({ extended: true }));
  //
  // Leemos el título del formulario:
  // - si no existe, usamos "" para evitar undefined
  // - trim() elimina espacios al inicio y final
  const title = (req.body.title || "").trim();

  // Leemos priority.
  // Si el usuario no envía nada (raro, porque el select es required),
  // ponemos por defecto "media".
  const priority = req.body.priority || "media";

  // Validación mínima:
  // - Si title está vacío, no creamos nada
  // - Redirigimos al listado
  if (!title) return res.redirect("/tasks");

  // Creamos el registro en la base de datos:
  // - title y priority se guardan
  // - done puede quedar por defecto (false)
  // - createdAt/updatedAt se rellenan automáticamente si timestamps está activo
  await Task.create({ title, priority });

  // Redirección después de POST:
  // Patrón Post/Redirect/Get:
  // - Evita reenvío del formulario si recargas (F5)
  // - El navegador vuelve a hacer un GET limpio
  res.redirect("/tasks");
};

// ===============================
// UPDATE: cambiar estado done (UPDATE)
// ===============================
exports.toggleDoneFromForm = async (req, res) => {

  // El id viene en la URL, por ejemplo:
  // POST /tasks/5/toggle
  // => req.params.id === "5"
  const { id } = req.params;

  // Buscamos la tarea por su clave primaria (id).
  // Si no existe, findByPk devuelve null.
  const task = await Task.findByPk(id);

  // Si no existe la tarea:
  // OJO: aquí hay un detalle: rediriges a "/task" (singular),
  // normalmente debería ser "/tasks".
  if (!task) return res.redirect("/task");

  // Toggle: invertimos el booleano
  // false -> true
  // true  -> false
  task.done = !task.done;

  // Guardamos la modificación en la BD:
  // save() actualiza el registro existente con los cambios.
  await task.save();

  // Volvemos al listado
  res.redirect("/tasks");
};

// ===============================
// UPDATE: actualizar el título (UPDATE)
// ===============================
exports.updateTitleFromForm = async (req, res) => {

  // ID del recurso a modificar
  const { id } = req.params;

  // Nuevo título desde el formulario
  const title = (req.body.title || "").trim();

  // Validación: no permitimos vacío
  if (!title) return res.redirect("/tasks");

  // Task.update(...) hace un UPDATE en BD.
  // - Primer parámetro: campos a cambiar
  // - Segundo parámetro: condición WHERE
  //
  // Esto en SQL sería algo como:
  // UPDATE Tasks SET title='...' WHERE id=...
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

  // ID de la tarea a borrar
  const { id } = req.params;

  // Task.destroy(...) elimina en BD:
  // DELETE FROM Tasks WHERE id=...
  await Task.destroy({
    where: { id }
  });

  // Volvemos al listado
  res.redirect("/tasks");
};
