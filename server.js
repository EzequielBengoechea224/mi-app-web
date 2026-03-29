import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Pool de conexiones
const db = mysql.createPool({
  host: "db",
  user: "root",
  password: "root",
  database: "testdb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 🧪 Ruta raíz
app.get("/", (req, res) => {
  res.send("✅ Servidor funcionando correctamente");
});

// =============================
// 🧱 CREAR TABLA (auto-init)
// =============================
db.query(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50)
  )
`);

// =============================
// 👥 ENDPOINTS USUARIOS
// =============================

// 👉 Obtener todos
app.get("/usuarios", (req, res) => {
  db.query("SELECT * FROM usuarios", (err, result) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

// 👉 Crear usuario
app.post("/usuarios", (req, res) => {
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: "El nombre es obligatorio" });
  }

  db.query("INSERT INTO usuarios (nombre) VALUES (?)", [nombre], (err, result) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json({
      message: "Usuario creado",
      id: result.insertId,
    });
  });
});

// 👉 Obtener uno por id
app.get("/usuarios/:id", (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM usuarios WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(result[0]);
  });
});

// 👉 Eliminar usuario
app.delete("/usuarios/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM usuarios WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: "Usuario eliminado" });
  });
});

// =============================
// 🧪 TEST DB
// =============================
app.get("/data", (req, res) => {
  db.query("SELECT 'Hola desde la DB 🚀' as mensaje", (err, result) => {
    if (err) {
      console.error("❌ Error en query:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json(result);
  });
});

// 🚀 Server
app.listen(3000, () => {
  console.log("🚀 Server corriendo en puerto 3000");
});
