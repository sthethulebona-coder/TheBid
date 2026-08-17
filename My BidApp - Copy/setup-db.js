const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const dbFile = './database.sqlite';

// Open (or create) the database file
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    console.log('Successfully created/connected to database.sqlite');
    initializeDatabase();
});

function initializeDatabase() {
    db.serialize(() => {
        // 1. Create tables
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

        // 2. Insert Products safely using standard multi-row execution
        db.run(`INSERT OR IGNORE INTO products (id, name, category, price, img, type) VALUES 
            (1, 'Halo', 'Shooter', 599.99, 'Halo.jpeg', 'game'),
            (2, 'Minecraft', 'Sandbox', 299.99, 'Minecraft.jpeg', 'game'),
            (3, 'Witcher 3', 'RPG', 399.99, 'Witcher3.jpeg', 'game'),
            (4, 'FC 25', 'Sports', 699.99, 'Fc25.jpeg', 'game'),
            (5, 'Overwatch 2', 'Shooter', 0.00, 'Overwatch2.jpeg', 'game'),
            (6, 'Logitech Mouse', 'Accessory', 499.99, 'Logitech.jpeg', 'equipment'),
            (7, 'Mechanical Keyboard', 'Peripheral', 899.99, 'Keyboard.jpeg', 'equipment'),
            (8, 'Gaming Chair', 'Furniture', 1999.99, 'Chair.jpeg', 'equipment'),
            (9, 'Headphones', 'Audio', 799.99, 'headphones.jpeg', 'equipment'),
            (10, 'Monitor', 'Display', 1499.99, 'Monitor.jpeg', 'equipment')
        `);

        // 3. Insert Auctions safely
        db.run(`INSERT OR IGNORE INTO auctions (id, name, currentBid, img) VALUES 
            (101, 'Rare Retro Console', 1200.00, 'Console.jpeg'),
            (102, 'Collector''s Edition Statue', 850.00, 'Statue.jpeg')
        `, (err) => {
            if (err) {
                console.error("Error seeding data:", err.message);
            } else {
                console.log("Database tables and default data populated successfully!");
            }
            // Close database connection safely after everything is done
            db.close();
        });
    });
}