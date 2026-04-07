require('dotenv').config();
const mongoose = require('mongoose');
const Attendance = require('./src/models/Attendance');

async function checkLogic() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const month = "4";
  const year = "2026";
  const organization = "698b492943d9ba38a8b240ea";
  
  const getDaysInMonth = (m, y) => new Date(y, m, 0).getDate();
  const totalDays = getDaysInMonth(month, year);
  console.log("totalDays:", totalDays);

  const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const endOfMonth = new Date(year, month - 1, totalDays, 23, 59, 59, 999);
  console.log("start:", startOfMonth, "end: ", endOfMonth);

  const holidayRecords = await Attendance.find({
      organization,
      status: 'Holiday',
      date: { $gte: startOfMonth, $lte: endOfMonth }
  });
  const holidayDates = [...new Set(holidayRecords.map(r => new Date(r.date).getDate()))];
  console.log("holidayDates:", holidayDates);

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

  console.log("baseWorkingDays:", baseWorkingDays);
  process.exit();
}
checkLogic().catch(console.error);
