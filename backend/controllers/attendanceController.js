import Attendance from '../models/Attendance.js';
import Member from '../models/Member.js';
import crypto from 'crypto';
import env from '../config/env.js';

const QR_SECRET = env.jwtSecret || 'ironfit-qr-secret';

export const getAttendance = async (req, res) => {
  try {
    const { memberId, date, startDate, endDate, status, page = 1, limit = 50 } = req.query;
    const query = {};
    if (memberId) query.memberId = memberId;
    if (status) query.status = status;
    if (date) {
      const d = new Date(date);
      query.date = { $gte: new Date(d.setHours(0,0,0,0)), $lte: new Date(d.setHours(23,59,59,999)) };
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const records = await Attendance.find(query)
      .populate('memberId', 'fullName email phone')
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Attendance.countDocuments(query);

    res.json({ records, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAttendance = async (req, res) => {
  try {
    const { memberId, date, checkInTime, status } = req.body;

    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    // Upsert: update if exists for same member+date, otherwise create
    const record = await Attendance.findOneAndUpdate(
      { memberId, date: new Date(date).setHours(0,0,0,0) },
      { memberId, date, checkInTime: checkInTime || new Date().toLocaleTimeString(), status: status || 'present' },
      { upsert: true, new: true, runValidators: true }
    ).populate('memberId', 'fullName email');

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, checkInTime, status } = req.body;

    const record = await Attendance.findByIdAndUpdate(
      id,
      { ...(date && { date }), ...(checkInTime && { checkInTime }), ...(status && { status }) },
      { new: true, runValidators: true }
    ).populate('memberId', 'fullName email');

    if (!record) return res.status(404).json({ message: 'Attendance record not found' });

    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Attendance.findByIdAndDelete(id);
    if (!record) return res.status(404).json({ message: 'Attendance record not found' });
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAttendanceReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const queryMonth = month || now.getMonth() + 1;
    const queryYear = year || now.getFullYear();

    const startDate = new Date(queryYear, queryMonth - 1, 1);
    const endDate = new Date(queryYear, queryMonth, 0, 23, 59, 59, 999);
    const daysInMonth = new Date(queryYear, queryMonth, 0).getDate();

    const records = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
    }).populate('memberId', 'fullName email');

    // Calculate per-member stats
    const memberStats = {};
    for (const r of records) {
      const id = r.memberId?._id?.toString() || r.memberId?.toString();
      if (!id) continue;
      if (!memberStats[id]) {
        memberStats[id] = {
          member: r.memberId,
          present: 0,
          absent: 0,
          late: 0,
          total: 0,
        };
      }
      memberStats[id][r.status]++;
      memberStats[id].total++;
    }

    const report = Object.values(memberStats).map((s) => ({
      ...s,
      percentage: daysInMonth > 0 ? Math.round((s.present / daysInMonth) * 100) : 0,
    }));

    // Overall monthly stats
    let totalPresent = 0, totalLate = 0, totalAbsent = 0;
    for (const s of report) {
      totalPresent += s.present;
      totalLate += s.late;
      totalAbsent += s.absent;
    }
    const totalDays = report.length > 0 ? report.reduce((sum, s) => sum + s.total, 0) : 0;

    res.json({
      report,
      summary: {
        totalMembers: report.length,
        totalPresent,
        totalLate,
        totalAbsent,
        totalRecords: totalDays,
        month: queryMonth,
        year: queryYear,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const scanAdminQRCode = async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData || typeof qrData !== 'string') {
      return res.status(400).json({ message: 'Invalid QR data' });
    }

    const cleanQrData = qrData.trim();
    const colonIndex = cleanQrData.indexOf(':');
    if (colonIndex === -1) {
      return res.status(400).json({ message: 'Invalid QR code format' });
    }

    const memberId = cleanQrData.substring(0, colonIndex).trim();
    const signature = cleanQrData.substring(colonIndex + 1).trim();

    const expectedSig = crypto.createHmac('sha256', QR_SECRET).update(memberId).digest('hex');

    if (signature !== expectedSig) {
      return res.status(400).json({ message: 'Invalid QR code signature' });
    }

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);

    const existing = await Attendance.findOne({
      memberId: member._id,
      date: { $gte: todayStart, $lt: todayEnd },
    });

    if (existing) {
      return res.status(409).json({
        message: 'Attendance already marked for today',
        existingRecord: existing,
      });
    }

    const record = await Attendance.create({
      memberId: member._id,
      date: new Date(),
      checkInTime: new Date().toLocaleTimeString(),
      status: 'present',
    });

    // Populate member details to send back
    const populatedRecord = await Attendance.findById(record._id).populate('memberId', 'fullName email profileImage');

    res.status(201).json({
      message: 'Attendance marked successfully',
      record: populatedRecord,
      member: { id: member._id, fullName: member.fullName },
    });
  } catch (error) {
    console.error('Scan Error:', error);
    res.status(500).json({ message: error.message });
  }
};
