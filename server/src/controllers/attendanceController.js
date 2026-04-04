const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const AttendanceClosure = require('../models/AttendanceClosure');

// @desc    Mark attendance (Check-in/Check-out or Manual)
// @route   POST /api/attendance
// @access  Private (Employee/Admin)
const markAttendance = async (req, res) => {
    const { employeeId, date, status, checkIn, checkOut, overtimeHours, isLOP } = req.body;

    // Check if the date is closed
    const attendanceDate = new Date(date || new Date());
    attendanceDate.setHours(0, 0, 0, 0);

    const closure = await AttendanceClosure.findOne({
        organization: req.user.organization,
        date: attendanceDate,
        isClosed: true
    });

    if (closure && req.user.role === 'Employee') {
        return res.status(403).json({ message: 'Attendance for this date is closed and cannot be modified.' });
    }

    // Logic to find employee from user
    let targetEmployeeId = employeeId;
    if (req.user.role === 'Employee') {
        const emp = await Employee.findOne({ user: req.user._id });
        if (!emp) return res.status(404).json({ message: 'Employee profile not found' });
        targetEmployeeId = emp._id;
    }

    // Upsert attendance for the date
    let attendance = await Attendance.findOne({
        employee: targetEmployeeId,
        date: attendanceDate
    });

    if (attendance) {
        attendance.status = status || attendance.status;
        attendance.checkIn = checkIn || attendance.checkIn;
        attendance.checkOut = checkOut || attendance.checkOut;
        // Only Admins can set OT and manual LOP flags via this endpoint
        if (req.user.role !== 'Employee') {
            attendance.overtimeHours = overtimeHours !== undefined ? overtimeHours : attendance.overtimeHours;
            attendance.isLOP = isLOP !== undefined ? isLOP : attendance.isLOP;
        }
    } else {
        attendance = new Attendance({
            employee: targetEmployeeId,
            organization: req.user.organization,
            date: attendanceDate,
            status: status || 'Present',
            checkIn,
            checkOut,
            overtimeHours: req.user.role !== 'Employee' ? overtimeHours : 0,
            isLOP: req.user.role !== 'Employee' ? isLOP : false
        });
    }

    await attendance.save();
    res.status(200).json(attendance);
};

// @desc    Get attendance for employee/month
// @route   GET /api/attendance
// @access  Private
const getAttendance = async (req, res) => {
    const { employeeId, month, year } = req.query;

    if (!req.user) return res.status(401).json({ message: 'User not found' });
    let query = { organization: req.user.organization };

    // If the requester is an Employee, restrict results to their own employee record
    if (req.user.role === 'Employee') {
        const emp = await Employee.findOne({ user: req.user._id });
        if (!emp) return res.status(404).json({ message: 'Employee profile not found' });
        query.employee = emp._id;
    } else {
        // Admins/HR can optionally pass employeeId to filter
        if (employeeId) query.employee = employeeId;
    }

    if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // Last day of month
        query.date = { $gte: startDate, $lte: endDate };
    }

    const records = await Attendance.find(query).populate('employee', 'employeeId');

    // Efficiency: check closure for the records if needed, but usually done on a per-day basis on frontend
    res.json(records);
};

// @desc    Close attendance for a date
// @route   POST /api/attendance/close
// @access  Private (Admin/HR)
const closeAttendance = async (req, res) => {
    try {
        const { date } = req.body;
        const closureDate = new Date(date || new Date());
        closureDate.setHours(0, 0, 0, 0);

        const organization = req.user.organization;

        let closure = await AttendanceClosure.findOne({ organization, date: closureDate });

        if (closure) {
            closure.isClosed = true;
            closure.closedBy = req.user._id;
            await closure.save();
        } else {
            closure = await AttendanceClosure.create({
                organization,
                date: closureDate,
                isClosed: true,
                closedBy: req.user._id
            });
        }

        res.status(200).json({ message: 'Attendance closed successfully', closure });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reopen attendance for a date
// @route   POST /api/attendance/reopen
// @access  Private (Admin/HR)
const reopenAttendance = async (req, res) => {
    try {
        const { date } = req.body;
        const closureDate = new Date(date || new Date());
        closureDate.setHours(0, 0, 0, 0);

        const organization = req.user.organization;

        await AttendanceClosure.findOneAndUpdate(
            { organization, date: closureDate },
            { isClosed: false, closedBy: req.user._id },
            { upsert: true }
        );

        res.status(200).json({ message: 'Attendance reopened successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get closure status for a date
// @route   GET /api/attendance/closure-status
// @access  Private
const getClosureStatus = async (req, res) => {
    try {
        const { date } = req.query;
        const checkDate = new Date(date || new Date());
        checkDate.setHours(0, 0, 0, 0);

        const closure = await AttendanceClosure.findOne({
            organization: req.user.organization,
            date: checkDate
        });

        res.json({ isClosed: closure ? closure.isClosed : false });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark holiday for all employees for a date
// @route   POST /api/attendance/holiday
// @access  Private (Admin/HR)
const markHolidayForAll = async (req, res) => {
    try {
        console.log('markHolidayForAll called for date:', req.body.date);
        const { date } = req.body;
        if (!date) {
            return res.status(400).json({ message: 'Date is required' });
        }

        const holidayDate = new Date(date);
        holidayDate.setHours(0, 0, 0, 0);

        const organization = req.user.organization;
        console.log('Org ID:', organization);

        // 1. Fetch all active employees in this organization
        const activeEmployees = await Employee.find({ 
            organization, 
            status: 'Active' 
        });

        console.log('Active employees found:', activeEmployees.length);

        if (activeEmployees.length === 0) {
            return res.status(404).json({ message: 'No active employees found in your organization' });
        }

        // 2. Prepare bulk operations for upserting attendance records
        const bulkOps = activeEmployees.map(emp => ({
            updateOne: {
                filter: { 
                    employee: emp._id, 
                    date: holidayDate,
                    organization: organization
                },
                update: {
                    $set: {
                        status: 'Holiday',
                        isLOP: false,
                        checkIn: null,
                        checkOut: null,
                        workHours: 0,
                        overtimeHours: 0
                    }
                },
                upsert: true
            }
        }));

        const result = await Attendance.bulkWrite(bulkOps);
        console.log('BulkWrite result:', result);

        res.status(200).json({ 
            message: `Holiday marked successfully for ${activeEmployees.length} employees for ${holidayDate.toDateString()}` 
        });
    } catch (error) {
        console.error('Error in markHolidayForAll:', error);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

module.exports = {
    markAttendance,
    getAttendance,
    closeAttendance,
    reopenAttendance,
    getClosureStatus,
    markHolidayForAll
};
