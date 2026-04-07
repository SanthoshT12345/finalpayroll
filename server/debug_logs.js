require('dotenv').config();
const mongoose = require('mongoose');
const AuditLog = require('./src/models/AuditLog');

async function checkLog() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const logs = await AuditLog.find({ action: 'Processed Payroll' }).sort({ createdAt: -1 }).limit(5);
  console.log("Recent Payroll Logs:", JSON.stringify(logs, null, 2));

  process.exit();
}
checkLog().catch(console.error);
