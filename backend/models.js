const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const User = model('User', new Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' }
}));
const Course = model('Course', new Schema({ code: String, title: String, faculty: String }));
const fb = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, maxlength: 1000 }
}, { timestamps: true });
fb.index({ student: 1, course: 1 }, { unique: true }); // one feedback per course
const Feedback = model('Feedback', fb);
module.exports = { User, Course, Feedback };
