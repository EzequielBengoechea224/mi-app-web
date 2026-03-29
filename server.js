import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();
app.use(cors());

// Config DB (Docker Compose)
const db = mysql.createConnection({
  host: "db",
  user: "root",
  password: "root",
  database: "testdb",
});

// 🔁 Conexión con retry seguro
function connectWithRetry() {
  console.log("⏳ Intentando conectar a MySQL...");

  db.connect((err) => {
    if (err) {
      console.error("❌ MySQL no listo. Reintentando en 3s...");
      console.error(err.code || err.message);

      setTimeout(connectWithRetry, 3000);
      return;
    }

    console.log("✅ Conectado a MySQL correctamente");
  });
}

// Iniciar conexión
connectWithRetry();

// 👇 Ruta raíz (esto te faltaba)
app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

// 🧪 Endpoint de prueba
app.get("/data", (req, res) => {
  db.query("SELECT 'Hola desde la DB' as mensaje", (err, result) => {
    if (err) {
      console.error("❌ Error en query:", err.code || err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json(result);
  });
});

// 🚀 Server
app.listen(3000, () => {
  console.log("🚀 Server corriendo en puerto 3000");
});
