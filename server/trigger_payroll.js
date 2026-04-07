require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');

async function triggerPayroll() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  // get a user
  const User = require('./src/models/User');
  const user = await User.findOne({ role: 'Super Admin' });
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

  try {
      const res = await axios.post('http://localhost:5000/api/payroll/run', {
          month: "4",
          year: "2026"
      }, {
          headers: {
              Authorization: `Bearer ${token}`
          }
      });
      console.log('Run Payroll response:', res.data);
  } catch (e) {
      console.error(e.response ? e.response.data : e.message);
  }

  process.exit();
}

triggerPayroll().catch(console.error);
