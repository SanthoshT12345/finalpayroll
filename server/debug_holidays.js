require('dotenv').config();
const mongoose = require('mongoose');
const Attendance = require('./src/models/Attendance');
const Payroll = require('./src/models/Payroll');

async function checkHolidays() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const month = 4;
  const year = 2026;
  const totalDays = new Date(year, month, 0).getDate();
  const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const endOfMonth = new Date(year, month - 1, totalDays, 23, 59, 59, 999);

  // Since we don't have the exactly organization string on hand, we will check all
  const holidayRecords = await Attendance.find({
      organization: "698b492943d9ba38a8b240ea",
      status: 'Holiday',
      date: { $gte: startOfMonth, $lte: endOfMonth }
  });
  
  const holidayDates = [...new Set(holidayRecords.map(r => new Date(r.date).getDate()))];
  console.log("Found holiday records:", holidayRecords.length);
  console.log("Unique holiday dates in local time:", holidayDates);

  let baseWorkingDays = 0;
  const workingDates = []; 

  for (let d = 1; d <= totalDays; d++) {
      const currentDate = new Date(year, month - 1, d);
      const isSunday = currentDate.getDay() === 0;
      const isHoliday = holidayDates.includes(d);

      if (!isSunday && !isHoliday) {
          baseWorkingDays++;
          workingDates.push(d);
      }
  }

  console.log("Calculated base working days:", baseWorkingDays);
  console.log("Working dates:", workingDates);

  process.exit();
}

checkHolidays().catch(console.error);
