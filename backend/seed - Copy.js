require('dotenv').config();
const mongoose = require('mongoose'), bcrypt = require('bcryptjs');
const { User, Course } = require('./models');
(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_feedback');
  await Course.deleteMany(); await User.deleteOne({ email: 'admin@college.edu' });
  await Course.insertMany([
    { code: 'CS101', title: 'Intro to Programming', faculty: 'Dr. Rao' },
    { code: 'CS204', title: 'Data Structures', faculty: 'Prof. Iyer' },
    { code: 'CS310', title: 'Database Systems', faculty: 'Dr. Nair' }]);
  await User.create({ name: 'Admin', email: 'admin@college.edu', role: 'admin', password: await bcrypt.hash('admin123', 10) });
  console.log('Seeded. Admin: admin@college.edu / admin123'); process.exit();
})();
