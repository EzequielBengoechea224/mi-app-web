const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());

const db = mysql.createConnection({
  host: "db",
  user: "root",
  password: "root",
  database: "testdb",
});

app.get("/data", (req, res) => {
  db.query("SELECT 'Hola desde la DB' as mensaje", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

app.listen(3000, () => {
  console.log("Server corriendo en puerto 3000");
});
