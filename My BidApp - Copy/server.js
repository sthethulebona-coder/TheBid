const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Connect to SQLite Database
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDatabase();
    }
});

// Initialize Tables and Default Data
function initDatabase() {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        email TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        name TEXT,
        category TEXT,
        price REAL,
        img TEXT,
        type TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS auctions (
        id INTEGER PRIMARY KEY,
        name TEXT,
        currentBid REAL,
        img TEXT
    )`);

    db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
        if (row && row.count === 0) {
            const initialProducts = [
                [1, "Halo", "Shooter", 599.99, "Halo.jpeg", "game"],
                [2, "Minecraft", "Sandbox", 299.99, "Minecraft.jpeg", "game"],
                [3, "Witcher 3", "RPG", 399.99, "Witcher3.jpeg", "game"],
                [4, "FC 25", "Sports", 699.99, "Fc25.jpeg", "game"],
                [5, "Overwatch 2", "Shooter", 0.00, "Overwatch2.jpeg", "game"],
                [6, "Logitech Mouse", "Accessory", 499.99, "Logitech.jpeg", "equipment"],
                [7, "Mechanical Keyboard", "Peripheral", 899.99, "Keyboard.jpeg", "equipment"],
                [8, "Gaming Chair", "Furniture", 1999.99, "Chair.jpeg", "equipment"],
                [9, "Headphones", "Audio", 799.99, "headphones.jpeg", "equipment"],
                [10, "Monitor", "Display", 1499.99, "Monitor.jpeg", "equipment"]
            ];
            const stmt = db.prepare("INSERT INTO products VALUES (?, ?, ?, ?, ?, ?)");
            initialProducts.forEach(p => stmt.run(p));
            stmt.finalize();
        }
    });

    db.get("SELECT COUNT(*) as count FROM auctions", (err, row) => {
        if (row && row.count === 0) {
            db.run("INSERT INTO auctions VALUES (101, 'Rare Retro Console', 1200.00, 'Console.jpeg')");
            db.run("INSERT INTO auctions VALUES (102, 'Collector''s Edition Statue', 850.00, 'Statue.jpeg')");
        }
    });
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Login.html'));
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password || password.length < 4) {
        return res.status(400).json({ success: false, message: "Invalid credentials or password too short." });
    }

    db.run(`INSERT OR IGNORE INTO users (username, password, email) VALUES (?, ?, ?)`, 
        [username, password, `${username}@example.com`], (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Database error." });
            }
            res.json({ success: true, username });
        });
});

app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/auctions', (req, res) => {
    db.all("SELECT * FROM auctions", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/bid', (req, res) => {
    const { id, newBid } = req.body;
    db.run("UPDATE auctions SET currentBid = ? WHERE id = ?", [newBid, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.listen(PORT, () => {
    console.log(`Server running successfully at http://localhost:${PORT}`);
});