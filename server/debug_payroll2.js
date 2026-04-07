require('dotenv').config();
const mongoose = require('mongoose');
const Payroll = require('./src/models/Payroll');

async function checkPayroll() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const month = 4;
  const year = 2026;
  const payrolls = await Payroll.find({ month, year });
  
  if (payrolls.length > 0) {
    console.log(`Found ${payrolls.length} payrolls for M:${month} Y:${year}`);
    console.log("First payroll:", JSON.stringify(payrolls[0], null, 2));
  } else {
    console.log(`No payrolls found for M:${month} Y:${year}`);
  }

  process.exit();
}

checkPayroll().catch(console.error);
