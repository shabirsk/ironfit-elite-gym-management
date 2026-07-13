import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { Parser } from 'json2csv';
import AutomationLog from '../models/AutomationLog.js';

export const generatePDF = async (title, options = {}) => {
  const { headers = [], rows = [], summary = [] } = options;
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40, info: { Title: title } });
      const bufs = [];
      doc.on('data', c => bufs.push(c));
      doc.on('end', () => resolve(Buffer.concat(bufs)));
      doc.on('error', reject);
      doc.font('Helvetica-Bold').fontSize(22).fillColor('#ff6200').text('IRONFIT ELITE', 40, 40);
      doc.fontSize(10).fillColor('#666').text('Premium Fitness Training', 40, 65);
      doc.fontSize(16).fillColor('#111').text(title, 40, 100);
      doc.moveTo(40, doc.y + 5).lineTo(550, doc.y + 5).strokeColor('#ddd').stroke();
      doc.moveDown(1.5);
      for (const s of summary) {
        doc.fontSize(11).fillColor('#333').text(s.label + ': ' + s.value);
        doc.moveDown(0.3);
      }
      if (headers.length > 0 && rows.length > 0) {
        const tTop = doc.y, cw = (510) / headers.length, rh = 20;
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#fff');
        headers.forEach((h, i) => { doc.rect(40 + i * cw, tTop, cw, rh).fill('#ff6200'); doc.fillColor('#fff').text(h, 44 + i * cw, tTop + 5); });
        let cy = tTop + rh;
        doc.font('Helvetica').fontSize(8).fillColor('#333');
        for (const row of rows) {
          if (cy > 750) { doc.addPage(); cy = 40; }
          doc.rect(40, cy, 510, rh).fill(rows.indexOf(row) % 2 === 0 ? '#f8f8f8' : '#fff');
          row.forEach((c, i) => doc.fillColor('#333').text(String(c||''), 44 + i * cw, cy + 5, { width: cw - 8 }));
          cy += rh;
        }
        doc.rect(40, tTop, 510, cy - tTop).strokeColor('#ddd').stroke();
      }
      doc.fontSize(8).fillColor('#999').text('Generated: ' + new Date().toLocaleString(), 40, doc.y + 20);
      doc.end();
    } catch(e) { reject(e); }
  });
};

export const generateExcel = async (sheetName, options = {}) => {
  const { headers = [], rows = [], summary = [] } = options;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'IronFit Elite';
  if (summary.length > 0) {
    const ss = wb.addWorksheet('Summary');
    ss.columns = [{ header: 'Metric', key: 'label', width: 30 }, { header: 'Value', key: 'value', width: 20 }];
    ss.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ss.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6200' } };
    summary.forEach(s => ss.addRow(s));
  }
  const ds = wb.addWorksheet(sheetName || 'Report');
  ds.mergeCells('A1:' + String.fromCharCode(64 + Math.max(headers.length, 1)) + '1');
  ds.getCell('A1').value = sheetName;
  ds.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFF6200' } };
  const hr = ds.getRow(2);
  headers.forEach((h, i) => hr.getCell(i + 1).value = h);
  hr.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  hr.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6200' } };
  headers.forEach((_, i) => ds.getColumn(i + 1).width = Math.max(15, 25 / Math.max(headers.length, 1)));
  rows.forEach(row => {
    const er = ds.addRow(row);
    er.eachCell(c => { c.font = { color: { argb: 'FF333333' } }; c.border = { top: { style: 'thin' }, bottom: { style: 'thin' } }; });
  });
  ds.views = [{ state: 'frozen', ySplit: 2 }];
  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
};

export const generateCSV = async (options = {}) => {
  const { fields = [], data = [] } = options;
  const p = new Parser({ fields, delimiter: ',', quote: '"', header: true });
  return p.parse(data);
};

export const logExport = async (type, format, count, status = 'success') => {
  try {
    await AutomationLog.create({
      category: 'system', automation: 'export-' + type, status,
      summary: format.toUpperCase() + ' export: ' + type + ' (' + count + ' records)',
      details: { exportType: type, format, recordsExported: count },
      recordsAffected: count, duration: 0, triggeredAt: new Date(),
    });
  } catch(e) {}
};