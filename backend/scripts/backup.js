import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backupDir = path.join(__dirname, '..', 'backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const filename = `ironfit-backup-${timestamp}.gz`;
const filepath = path.join(backupDir, filename);

if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

// Expect MONGO_URI in env already loaded by the app
export const runBackup = async () => {
  try {
    const mongoose = (await import('mongoose')).default;
    const uri = mongoose.connection.client.s.url;
    const dbName = mongoose.connection.db.databaseName;

    // Use mongodump for a full DB dump
    execSync(`mongodump --uri="${uri}" --archive="${filepath}" --gzip`, { stdio: 'inherit' });

    const stats = fs.statSync(filepath);
    console.log(`[Backup] Created: ${filename} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

    // Keep last 7 backups, delete older ones
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('ironfit-backup-'))
      .map(f => ({ name: f, time: fs.statSync(path.join(backupDir, f)).mtimeMs }))
      .sort((a, b) => b.time - a.time);

    if (files.length > 7) {
      for (const old of files.slice(7)) {
        fs.unlinkSync(path.join(backupDir, old.name));
        console.log(`[Backup] Deleted old backup: ${old.name}`);
      }
    }

    return { success: true, path: filepath, size: stats.size };
  } catch (error) {
    console.error('[Backup] Failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Allow direct CLI execution
if (process.argv[1] && process.argv[1].includes('backup.js')) {
  const mg = await import('mongoose');
  await mg.default.connect(process.env.MONGO_URI);
  await runBackup();
  await mg.default.disconnect();
  process.exit(0);
}
