const mongoose = require('mongoose');
const Attendance = require('./src/models/Attendance');
const Organization = require('./src/models/Organization');
const dotenv = require('dotenv');
dotenv.config();

async function debug() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        const month = 2;
        const year = 2026;
        
        const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
        const endOfMonth = new Date(Date.UTC(year, month - 1, 28, 23, 59, 59, 999));

        const holidays = await Attendance.find({
            status: 'Holiday',
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        console.log('Total Holiday Records Found:', holidays.length);
        
        const distinctHolidays = [...new Set(holidays.map(h => h.date.toISOString()))];
        console.log('Distinct Holiday Dates (ISO):', distinctHolidays);

        const holidayDatesUTC = [...new Set(holidays.map(h => h.date.getUTCDate()))];
        console.log('Holiday Date Numbers (UTC):', holidayDatesUTC);

        const Sundays = [];
        for (let d = 1; d <= 28; d++) {
            if (new Date(Date.UTC(year, month - 1, d)).getUTCDay() === 0) {
                Sundays.push(d);
            }
        }
        console.log('Sundays (UTC):', Sundays);

        const union = [...new Set([...holidayDatesUTC, ...Sundays])].sort((a,b) => a-b);
        console.log('Non-Working Days (Union):', union);
        console.log('Count:', union.length);
        console.log('Working Days Calculation:', 28 - union.length);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
