import { generatePDF, generateExcel, generateCSV, logExport } from '../lib/exports.js';
import Payment from '../models/Payment.js';
import Member from '../models/Member.js';
import Attendance from '../models/Attendance.js';
import Subscription from '../models/Subscription.js';
import Plan from '../models/Plan.js';

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const exportRevenueReport = async (req, res) => {
  try {
    const format = req.params.format;
    const year = req.query.year || new Date().getFullYear();
    const revenueByMonth = await Payment.aggregate([
      { $match: { status: { $in: ['completed','pending'] }, paymentDate: { $gte: new Date(year,0,1), $lte: new Date(year,11,31,23,59,59,999) } } },
      { $group: { _id: { $month: '$paymentDate' }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const totalRev = revenueByMonth.reduce((s,m) => s+m.total, 0);
    const headers = ['Month','Revenue','Transactions'];
    const rows = months.map((m,i) => { const d = revenueByMonth.find(r => r._id === i+1); return [m, '$'+(d?.total||0).toFixed(2), String(d?.count||0)]; });
    const summary = [{label:'Year',value:String(year)},{label:'Total Revenue',value:'$'+totalRev.toFixed(2)}];
    
    if (format === 'pdf') {
      const pdf = await generatePDF('Revenue Report '+year, {headers,rows,summary});
      res.setHeader('Content-Type','application/pdf');
      res.setHeader('Content-Disposition','attachment; filename="revenue-'+year+'.pdf"');
      res.send(pdf);
      await logExport('revenue','pdf',rows.length);
    } else if (format === 'excel') {
      const buf = await generateExcel('Revenue '+year, {headers,rows,summary});
      res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition','attachment; filename="revenue-'+year+'.xlsx"');
      res.send(buf);
      await logExport('revenue','excel',rows.length);
    } else if (format === 'csv') {
      const data = months.map((m,i) => { const d = revenueByMonth.find(r => r._id === i+1); return {Month:m, Revenue:(d?.total||0).toFixed(2), Transactions:d?.count||0, Year:Number(year)}; });
      const csv = await generateCSV({fields:['Month','Revenue','Transactions','Year'], data});
      res.setHeader('Content-Type','text/csv');
      res.setHeader('Content-Disposition','attachment; filename="revenue-'+year+'.csv"');
      res.send(csv);
      await logExport('revenue','csv',data.length);
    }
  } catch(e) { res.status(500).json({message:'Export failed', error: e.message}); }
};

export const exportAttendanceReport = async (req, res) => {
  try {
    const format = req.params.format;
    const now = new Date();
    const qm = parseInt(req.query.month) || now.getMonth()+1;
    const qy = parseInt(req.query.year) || now.getFullYear();
    const sd = new Date(qy, qm-1, 1);
    const ed = new Date(qy, qm, 0, 23,59,59,999);
    const dim = new Date(qy, qm, 0).getDate();
    const records = await Attendance.find({date:{$gte:sd,$lte:ed}}).populate('memberId','fullName email').lean();
    const ms = {};
    for (const r of records) {
      const id = r.memberId?._id?.toString() || r.memberId?.toString();
      if (!id) continue;
      if (!ms[id]) ms[id] = {member:r.memberId, present:0, absent:0, late:0, total:0};
      ms[id][r.status]++; ms[id].total++;
    }
    const report = Object.values(ms).map(s => ({...s, percentage: dim > 0 ? Math.round((s.present/dim)*100) : 0}));
    const ml = months[qm-1];
    const headers = ['Member','Present','Late','Absent','Total','Percentage'];
    const rows = report.map(s => [s.member?.fullName||'Unknown', String(s.present||0), String(s.late||0), String(s.absent||0), String(s.total||0), s.percentage+'%']);
    const summary = [{label:'Month',value:ml+' '+qy},{label:'Members',value:String(report.length)},{label:'Records',value:String(records.length)},{label:'Days',value:String(dim)}];
    
    if (format === 'pdf') {
      const pdf = await generatePDF('Attendance - '+ml+' '+qy, {headers,rows,summary});
      res.setHeader('Content-Type','application/pdf');
      res.setHeader('Content-Disposition','attachment; filename="attendance-'+ml+'-'+qy+'.pdf"');
      res.send(pdf);
      await logExport('attendance','pdf',rows.length);
    } else if (format === 'excel') {
      const buf = await generateExcel('Attendance '+ml+' '+qy, {headers,rows,summary});
      res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition','attachment; filename="attendance-'+ml+'-'+qy+'.xlsx"');
      res.send(buf);
      await logExport('attendance','excel',rows.length);
    } else if (format === 'csv') {
      const data = report.map(s => ({Member:s.member?.fullName||'', Present:s.present||0, Late:s.late||0, Absent:s.absent||0, Total:s.total||0, Percentage:s.percentage+'%'}));
      const csv = await generateCSV({fields:['Member','Present','Late','Absent','Total','Percentage'], data});
      res.setHeader('Content-Type','text/csv');
      res.setHeader('Content-Disposition','attachment; filename="attendance-'+ml+'-'+qy+'.csv"');
      res.send(csv);
      await logExport('attendance','csv',data.length);
    }
  } catch(e) { res.status(500).json({message:'Export failed', error: e.message}); }
};

export const exportMembersReport = async (req, res) => {
  try {
    const format = req.params.format;
    const q = {};
    if (req.query.status) q.status = req.query.status;
    const members = await Member.find(q).populate('planId','planName').populate('trainerId','fullName').sort({createdAt:-1}).lean();
    const headers = ['Name','Email','Phone','Plan','Trainer','Status','Joined'];
    const rows = members.map(m => [m.fullName, m.email, m.phone||'-', m.planId?.planName||'-', m.trainerId?.fullName||'-', m.status, new Date(m.joinDate).toLocaleDateString()]);
    const sc = {}; members.forEach(m => { sc[m.status] = (sc[m.status]||0)+1; });
    const summary = [{label:'Total',value:String(members.length)}, ...Object.entries(sc).map(([k,v])=>({label:k,value:String(v)}))];
    
    if (format === 'pdf') {
      const pdf = await generatePDF('Members Report', {headers,rows,summary});
      res.setHeader('Content-Type','application/pdf');
      res.setHeader('Content-Disposition','attachment; filename="members-report.pdf"');
      res.send(pdf);
      await logExport('members','pdf',rows.length);
    } else if (format === 'excel') {
      const buf = await generateExcel('Members', {headers,rows,summary});
      res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition','attachment; filename="members-report.xlsx"');
      res.send(buf);
      await logExport('members','excel',rows.length);
    } else if (format === 'csv') {
      const data = members.map(m => ({Name:m.fullName, Email:m.email, Phone:m.phone||'', Plan:m.planId?.planName||'', Trainer:m.trainerId?.fullName||'', Status:m.status}));
      const csv = await generateCSV({fields:['Name','Email','Phone','Plan','Trainer','Status'], data});
      res.setHeader('Content-Type','text/csv');
      res.setHeader('Content-Disposition','attachment; filename="members-report.csv"');
      res.send(csv);
      await logExport('members','csv',data.length);
    }
  } catch(e) { res.status(500).json({message:'Export failed', error: e.message}); }
};
