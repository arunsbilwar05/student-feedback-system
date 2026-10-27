require('dotenv').config();
const express = require('express'), mongoose = require('mongoose'), cors = require('cors');
const bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken');
const { User, Course, Feedback } = require('./models');
const app = express(); app.use(cors(), express.json());
const SECRET = process.env.JWT_SECRET || 'dev-secret';

const auth = (role) => (req, res, next) => {
  try {
    req.user = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), SECRET);
    if (role && req.user.role !== role) return res.status(403).json({ error: 'Not allowed' });
    next();
  } catch { res.status(401).json({ error: 'Please sign in' }); }
};
const sign = (u) => ({
  token: jwt.sign({ id: u._id, role: u.role }, SECRET, { expiresIn: '2h' }),
  user: { name: u.name, role: u.role }
});

// Student authentication
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6)
    return res.status(400).json({ error: 'Name, email and a 6+ character password are required' });
  try {
    const u = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
    res.json(sign(u));
  } catch { res.status(409).json({ error: 'Email already registered' }); }
});
app.post('/api/auth/login', async (req, res) => {
  const u = await User.findOne({ email: req.body.email });
  if (!u || !(await bcrypt.compare(req.body.password || '', u.password)))
    return res.status(401).json({ error: 'Wrong email or password' });
  res.json(sign(u));
});

// Course selection
app.get('/api/courses', auth(), async (_, res) => res.json(await Course.find()));

// Feedback submission (rating + comment)
app.post('/api/feedback', auth('student'), async (req, res) => {
  const { course, rating, comment } = req.body;
  if (!course || !(rating >= 1 && rating <= 5)) return res.status(400).json({ error: 'Choose a course and a rating of 1-5' });
  try {
    await Feedback.create({ student: req.user.id, course, rating, comment });
    res.status(201).json({ ok: true });
  } catch { res.status(409).json({ error: 'You already reviewed this course' }); }
});
app.get('/api/feedback/mine', auth('student'), async (req, res) =>
  res.json(await Feedback.find({ student: req.user.id }).select('course')));

// Faculty/admin view
app.get('/api/admin/feedback', auth('admin'), async (_, res) =>
  res.json(await Feedback.find().sort('-createdAt').populate('course', 'code title faculty').populate('student', 'name')));
app.get('/api/admin/summary', auth('admin'), async (_, res) =>
  res.json(await Feedback.aggregate([
    { $group: { _id: '$course', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'c' } },
    { $unwind: '$c' },
    { $project: { code: '$c.code', title: '$c.title', faculty: '$c.faculty', avg: { $round: ['$avg', 2] }, count: 1 } }
  ])));

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_feedback')
  .then(() => app.listen(process.env.PORT || 5000, () => console.log('API on :' + (process.env.PORT || 5000))))
  .catch((e) => { console.error(e.message); process.exit(1); });
