require('dotenv').config();
const mongoose = require('mongoose');
const { runPayroll } = require('./src/controllers/payrollController');

async function triggerDirect() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const User = require('./src/models/User');
  const user = await User.findOne({ role: 'Super Admin' });
  
  const req = {
      body: { month: "4", year: "2026" },
      user: { _id: user._id, organization: user.organization, role: user.role },
      ip: "127.0.0.1"
  };

  const res = {
      status: (code) => ({ json: (data) => console.log('Status', code, data) }),
      json: (data) => console.log('Success:', data.message, "Count:", data.count)
  };

  await runPayroll(req, res);
  process.exit();
}

triggerDirect().catch(console.error);
