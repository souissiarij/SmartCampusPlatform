const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');

(async () => {
    // Looks for data.db in current folder (Root)
    const db = await open({
        filename: path.join(__dirname, 'data.db'),
        driver: sqlite3.Database
    });

    const sqlPath = path.join(__dirname, 'database.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log("Re-initializing database...");
    await db.exec(sqlContent);
    console.log("Database ready.");
})();