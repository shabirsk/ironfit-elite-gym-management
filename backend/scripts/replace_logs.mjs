import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

function replaceConsoleWithLogger(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes("import logger from")) {
    const importStr = "import logger from '../utils/logger.js';\n";
    content = importStr + content;
  }

  content = content.replace(/console\.log/g, 'logger.info');
  content = content.replace(/console\.error/g, 'logger.error');
  content = content.replace(/console\.warn/g, 'logger.warn');

  fs.writeFileSync(filePath, content);
  console.log('Updated ' + filePath);
}

const jobsDir = path.join(rootDir, 'jobs');
fs.readdirSync(jobsDir).forEach(file => {
  if (file.endsWith('.js')) {
    replaceConsoleWithLogger(path.join(jobsDir, file));
  }
});

const whatsappControllerPath = path.join(rootDir, 'controllers', 'whatsappController.js');
if (fs.existsSync(whatsappControllerPath)) {
  let wContent = fs.readFileSync(whatsappControllerPath, 'utf8');
  if (!wContent.includes("import logger from")) {
    wContent = "import logger from '../utils/logger.js';\n" + wContent;
  }
  wContent = wContent.replace(/console\.log/g, 'logger.info');
  wContent = wContent.replace(/console\.error/g, 'logger.error');
  wContent = wContent.replace(/console\.warn/g, 'logger.warn');
  fs.writeFileSync(whatsappControllerPath, wContent);
  console.log('Updated whatsappController');
}

const dbConfigPath = path.join(rootDir, 'config', 'db.js');
if (fs.existsSync(dbConfigPath)) {
  let dbContent = fs.readFileSync(dbConfigPath, 'utf8');
  if (!dbContent.includes("import logger from")) {
    dbContent = "import logger from '../utils/logger.js';\n" + dbContent;
  }
  dbContent = dbContent.replace(/console\.log/g, 'logger.info');
  dbContent = dbContent.replace(/console\.error/g, 'logger.error');
  dbContent = dbContent.replace(/console\.warn/g, 'logger.warn');
  fs.writeFileSync(dbConfigPath, dbContent);
  console.log('Updated db.js');
}
