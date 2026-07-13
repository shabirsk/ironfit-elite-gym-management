import Program from '../models/Program.js';

export const getPrograms = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;
    const programs = await Program.find(query).sort({ sortOrder: 1, createdAt: -1 });
    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) return res.status(404).json({ message: 'Program not found' });
    res.json(program);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProgram = async (req, res) => {
  try {
    const program = await Program.create(req.body);
    res.status(201).json(program);
  } catch (error) {
    // Mongoose validation error — return 400 with field-level detail
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        message: 'Validation failed: ' + messages.join(', '),
        errors: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {}),
      });
    }
    // Duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A program with this value already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateProgram = async (req, res) => {
  try {
    const program = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!program) return res.status(404).json({ message: 'Program not found' });
    res.json(program);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        message: 'Validation failed: ' + messages.join(', '),
        errors: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {}),
      });
    }
    res.status(500).json({ message: error.message });
  }
};

export const deleteProgram = async (req, res) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);
    if (!program) return res.status(404).json({ message: 'Program not found' });
    res.json({ message: 'Program deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
