require("dotenv").config();
const express= require("express");
const sequelize = require("./config/db"); 
const taskRoutes = require("./routes/taskRoutes");

const app = express();

app.use(express.urlencoded( { extended: true }));

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use(taskRoutes);

app.get("/", (req, res) => res.send("OK - MVC FUNCIONANDO"));




const PORT = process.env.PORT || 3000;


(async () => {

   try {
   
    await sequelize.authenticate();

    await sequelize.sync( { alter: true });

    app.listen(PORT, () => 
        console.log(`servidor escucha en localhots:${PORT}`)
    );

   } catch (err) {
    console.error("error al inicializar, ", err);

    process.exit(1);
   }


})();