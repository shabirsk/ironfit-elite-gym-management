import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: [true, 'Member is required'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  checkInTime: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    default: 'present',
  },
}, { timestamps: true });

attendanceSchema.index({ memberId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
