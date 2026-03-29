import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 Pool
const db = mysql.createPool({
  host: "db",
  user: "root",
  password: "root",
  database: "testdb",
  waitForConnections: true,
  connectionLimit: 10,
});

// 🔄 Esperar a MySQL
const waitForDB = () => {
  return new Promise((resolve) => {
    const tryConnect = () => {
      console.log("⏳ Intentando conectar a MySQL...");

      db.query("SELECT 1", (err) => {
        if (err) {
          console.log("❌ MySQL no listo. Reintentando en 3s...");
          setTimeout(tryConnect, 3000);
        } else {
          console.log("✅ Conectado a MySQL!");
          resolve();
        }
      });
    };

    tryConnect();
  });
};

// 🧪 Root
app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

// 📊 Test DB
app.get("/data", (req, res) => {
  db.query("SELECT 'Hola desde MySQL 🚀' as mensaje", (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

// 👤 Crear tabla usuarios automáticamente
const createTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255)
    )
  `;

  db.query(sql, (err) => {
    if (err) console.error("Error creando tabla:", err);
    else console.log("📦 Tabla users lista");
  });
};

// 📥 Crear usuario
app.post("/users", (req, res) => {
  const { name, email } = req.body;

  const sql = "INSERT INTO users (name, email) VALUES (?, ?)";
  db.query(sql, [name, email], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId, name, email });
  });
});

// 📤 Obtener usuarios
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// 🚀 START APP
const start = async () => {
  await waitForDB(); // 🔥 clave
  createTable(); // 🔥 crea tabla automáticamente

  app.listen(3000, () => {
    console.log("🚀 Server corriendo en puerto 3000");
  });
};

start();
