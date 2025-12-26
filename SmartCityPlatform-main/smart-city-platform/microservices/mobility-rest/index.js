const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
// Importation de la configuration Swagger
const { swaggerUi, specs } = require('./swagger');

const app = express();
const port = 3001;

// Middleware pour parser le JSON et gérer les CORS
app.use(express.json());
app.use(cors());

// --- SWAGGER UI ---
// Cette ligne doit être accessible sans forcer le JSON
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// --- DOCUMENTATION JSDOC (Routes définies ci-dessous) ---

/**
 * @swagger
 * tags:
 *   name: Transports
 *   description: API pour gérer la mobilité sur le campus (Navettes, Vélos)
 */

/**
 * @swagger
 * /transports:
 *   get:
 *     summary: Récupérer tous les transports
 *     tags: [Transports]
 *     parameters:
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         description: Filtrer par destination
 *     responses:
 *       200:
 *         description: Liste des transports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   type:
 *                     type: string
 *                   line:
 *                     type: string
 *                   status:
 *                     type: string
 *                   destination:
 *                     type: string
 *                   stops:
 *                     type: array
 *                     items:
 *                       type: string
 */

/**
 * @swagger
 * /destinations:
 *   get:
 *     summary: Récupérer toutes les destinations uniques
 *     tags: [Transports]
 *     responses:
 *       200:
 *         description: Liste des destinations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */

/**
 * @swagger
 * /transports:
 *   post:
 *     summary: Ajouter un nouveau transport
 *     tags: [Transports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - line
 *               - status
 *               - destination
 *             properties:
 *               type:
 *                 type: string
 *               line:
 *                 type: string
 *               status:
 *                 type: string
 *               destination:
 *                 type: string
 *               stops:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Transport ajouté avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 type:
 *                   type: string
 *                 line:
 *                   type: string
 *                 status:
 *                   type: string
 *                 destination:
 *                   type: string
 *                 stops:
 *                   type: array
 *                   items:
 *                     type: string
 */

// --- BASE DE DONNÉES ---

const dbPath = process.env.DB_PATH || path.join(__dirname, 'data.db');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(" Error opening DB:", err.message);
        console.error("Attempted path:", dbPath);
    } else {
        console.log(" Connected to SQLite database at:", dbPath);
    }
});

// --- ROUTES ---

// ROUTE 1: Get transports
app.get('/transports', (req, res) => {
    const dest = req.query.destination;

    const callback = (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const transports = rows.map(row => ({
            ...row,
            stops: JSON.parse(row.stops || '[]')
        }));

        res.json(transports);
    };

    if (dest) {
        db.all("SELECT * FROM transports WHERE destination = ?", [dest], callback);
    } else {
        db.all("SELECT * FROM transports", [], callback);
    }
});

// ROUTE 2: Get unique destinations
app.get('/destinations', (req, res) => {
    db.all("SELECT DISTINCT destination FROM transports", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const citiesList = rows.map(row => row.destination);
        res.json(citiesList);
    });
});

// ROUTE 3: Add transport (POST)
app.post('/transports', (req, res) => {
    const { type, line, status, destination, stops } = req.body;
    const stopsJson = JSON.stringify(stops || []);

    const stmt = db.prepare("INSERT INTO transports (type, line, status, destination, stops) VALUES (?, ?, ?, ?, ?)");

    stmt.run(type, line, status, destination, stopsJson, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, type, line, status, destination, stops });
    });
    stmt.finalize();
});

// --- DÉMARRAGE DU SERVEUR ---

app.listen(port, () => {
    console.log(`Mobility Service (REST) running on port ${port}`);
    console.log(`Swagger UI: http://localhost:${port}/api-docs`);
});