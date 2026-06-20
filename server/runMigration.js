import pool from './db/connection.js';
import fs from 'fs';
import path from 'path';

async function runMigration() {
    try {
        const sql = fs.readFileSync(path.join(process.cwd(), 'db/migrations/014_alter_users_add_notifications.sql'), 'utf-8');
        await pool.query(sql);
        console.log('Migration 014 applied successfully.');
        process.exit(0);
    } catch (e) {
        console.error('Migration failed:', e);
        process.exit(1);
    }
}
runMigration();
