const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const SalaryStructure = require('../models/SalaryStructure');
const Statutory = require('../models/Statutory');
const AuditLog = require('../models/AuditLog');
const TaxDeclaration = require('../models/TaxDeclaration');
const { calculateTax } = require('../utils/taxCalculator');
const { logAction, notifyUser, notifyAllEmployees } = require('../utils/logger');

// Helper to calculate days in month
const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();

// @desc    Initiate/Calculate Payroll for a month
// @route   POST /api/payroll/run
// @access  Private (Payroll Admin)
const runPayroll = async (req, res) => {
    const { month, year, employeeIds } = req.body;
    const organization = req.user.organization;

    try {
        // Fetch Organization Statutory Config
        const statutory = await Statutory.findOne({ organization });

        // Fetch Employees (All or specific list)
        let query = { organization, status: 'Active' };
        if (employeeIds && employeeIds.length > 0) {
            query._id = { $in: employeeIds };
        }
        const employees = await Employee.find(query);

        const payrollResults = [];

        for (const emp of employees) {
            // 1. Get Salary Structure
            // Ideally link structure to employee. For now fetching all structures and finding one (Mock logic)
            // or assuming default mock structure if not linked.
            // In real app: const structure = await SalaryStructure.findById(emp.salaryStructure);

            // Simplification: Fetch *any* structure for demo if not linked
            const structure = await SalaryStructure.findOne({ organization });

            if (!structure) {
                console.log(`No salary structure for ${emp.user.name}`);
                continue;
            }

            // 2. Access Attendance
            const totalDays = getDaysInMonth(month, year);
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);

            const attendanceRecords = await Attendance.find({
                employee: emp._id,
                date: { $gte: startDate, $lte: endDate }
            });

            // Simple calculation: Count records present/leave/holiday
            // For demo: assume untracked days are present if Active, or strictly count records.
            // Let's rely on manual input or count present records.
            const presentCount = attendanceRecords.filter(r => r.status === 'Present' || r.status === 'Half Day').length;
            // Assume perfect attendance if no records for simplified demo? Or strict? 
            // Let's Auto-fill for demo purposes: 
            const paidDays = presentCount > 0 ? presentCount : totalDays;
            const lopDays = totalDays - paidDays;

            // 3. Calculate Components
            const earnings = [];
            let grossSalary = 0;

            for (const compRef of structure.components) {
                const comp = compRef.component; // populated
                if (!comp) continue; // Safety check - populate manually below if needed

                // Need to fetch component details if not populated in structure find above
                // In this loop structure is from findOne which IS NOT populated by default unless we used .populate()
                // Let's fix structure fetching to populate components.
            }
        }

        // Re-write simpler loop with proper population
        // Call helper function
        await generatePayrollBatch(employees, month, year, organization, statutory, res, req.user._id, req.ip);

    } catch (error) {
        console.error('Payroll processing error:', error);
        res.status(500).json({ message: 'Payroll processing failed', error: error.message });
    }
};

const generatePayrollBatch = async (employees, month, year, organization, statutory, res, userId, ip) => {
    const results = [];
    const totalDays = getDaysInMonth(month, year);
    // Pre-calculate organization holidays for this month using local date matching
    // Using start/end at midnight local to capture all records for the month
    const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, month - 1, totalDays, 23, 59, 59, 999);

    const holidayRecords = await Attendance.find({
        organization,
        status: 'Holiday',
        date: { $gte: startOfMonth, $lte: endOfMonth }
    });
    // Extract unique day numbers in local time
    const holidayDates = [...new Set(holidayRecords.map(r => new Date(r.date).getDate()))];

    // Calculate base working days (Exclude Sundays and Holidays)
    let baseWorkingDays = 0;
    const workingDates = []; // Days that are neither Sunday nor Holiday

    for (let d = 1; d <= totalDays; d++) {
        // Use local date for consistent day-of-week calculation
        const currentDate = new Date(year, month - 1, d);
        const isSunday = currentDate.getDay() === 0;
        const isHoliday = holidayDates.includes(d);

        if (!isSunday && !isHoliday) {
            baseWorkingDays++;
            workingDates.push(d);
        }
    }

    // Optimize: Fetch all structures populated
    const structures = await SalaryStructure.find({ organization }).populate('components.component');

    for (const emp of employees) {
        // Use employee's linked structure or fallback to first one
        const structure = emp.salaryStructure
            ? structures.find(s => s._id.toString() === emp.salaryStructure.toString())
            : structures[0];

        if (!structure) {
            console.log(`No salary structure found for ${emp.employeeId}`);
            continue;
        }
        console.log(`Processing ${emp.employeeId} (${emp.user?.name}) with Structure: ${structure.name}`);

        // Attendance Logic
        const attendanceRecords = await Attendance.find({
            employee: emp._id,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        // Calculate paid days only on "Working Days" (denominator exclusion logic)
        // Present, Leave (paid) = 1 full day each
        // Half Day = 0.5 days
        // Automation: Unmarked Working Days = 1 Paid Day (Assuming full attendance if not marked otherwise)
        // LOP, Absent, or Marked Holiday/Sunday (if they are already excluded from denominator) = 0 days

        let calculatedPaidDays = 0;

        for (const d of workingDates) {
            // Check if there's a record for this specific day (local date match)
            const record = attendanceRecords.find(r =>
                new Date(r.date).getDate() === d
            );

            if (record) {
                if (record.status === 'Present') calculatedPaidDays += 1;
                else if (record.status === 'Leave' && record.isLOP !== true) calculatedPaidDays += 1;
                else if (record.status === 'Half Day') calculatedPaidDays += 0.5;
                // 'Absent', 'Holiday', or status with isLOP=true adds 0
            } else {
                // Automation: If unmarked and it's a working day, count as paid (standard practice for "Present by default")
                calculatedPaidDays += 1;
            }
        }

        const paidDays = calculatedPaidDays;
        const workingDays = baseWorkingDays;

        // Overtime Calculation
        const totalOvertimeHours = attendanceRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);

        // LOP days = Total working days - Paid days
        const lopDays = Math.max(0, workingDays - paidDays);

        // Pay ratio for pro-rata salary calculation
        // Ensure denominator is not 0
        const payRatio = workingDays > 0 ? (paidDays / workingDays) : 0;

        const processedEarnings = [];
        const processedDeductions = [];
        let gross = 0;

        // 1. Calculate Earnings (First pass for Basic used in percentages)
        let basicAmount = 0;
        let perHourBasic = 0;

        // Identify Basic Component first
        const basicCompItem = structure.components.find(item => item.component?.name.toLowerCase().includes('basic'));
        if (basicCompItem) {
            const fullBasic = basicCompItem.value || basicCompItem.component.value;
            basicAmount = Math.round(fullBasic * payRatio);
            // Assuming 8 hours * 25 days (avg) per month for OT rate reference
            perHourBasic = fullBasic / (workingDays * 8);
        }

        // Process all components
        structure.components.forEach(item => {
            const comp = item.component;
            if (!comp) return;

            let amount = 0;
            const configValue = item.value || comp.value;

            if (item.calculationType === 'Flat Amount' || comp.calculationType === 'Flat Amount') {
                amount = configValue;
            } else if (item.calculationType === 'Percentage of Basic' || comp.calculationType === 'Percentage of Basic') {
                amount = (configValue / 100) * (basicCompItem ? (basicCompItem.value || basicCompItem.component.value) : 0);
            }

            // Apply LOP Pro-rata
            const payableAmount = Math.round(amount * payRatio);

            if (comp.type === 'Earning') {
                processedEarnings.push({ name: comp.name, amount: payableAmount });
                gross += payableAmount;
            } else {
                processedDeductions.push({ name: comp.name, amount: payableAmount });
            }
        });

        // 1.5. Overtime Pay Calculation (Typical rate: 1.5x of hourly basic)
        const overtimePay = Math.round(totalOvertimeHours * (perHourBasic * 1.5));
        if (overtimePay > 0) {
            processedEarnings.push({ name: 'Overtime Pay', amount: overtimePay });
            gross += overtimePay;
        }

        // 2. Statutory Deductions
        // PF Calculation (Typically on Basic or Gross up to limit)
        if (statutory?.pf?.enabled) {
            const pfWage = Math.min(basicAmount, statutory.pf.wageLimit || 15000);
            const pfAmount = Math.round(pfWage * (statutory.pf.employeeContribution / 100));
            if (pfAmount > 0) {
                processedDeductions.push({ name: 'Provident Fund', amount: pfAmount });
            }
        }

        // ESI Calculation (On Gross if Gross <= Limit)
        if (statutory?.esi?.enabled && gross <= (statutory.esi.wageLimit || 21000)) {
            const esiAmount = Math.round(gross * (statutory.esi.employeeContribution / 100));
            if (esiAmount > 0) {
                processedDeductions.push({ name: 'ESI', amount: esiAmount });
            }
        }

        // Professional Tax (Based on Slabs)
        if (statutory?.professionalTax?.enabled) {
            const slab = statutory.professionalTax.slabs.find(s => gross >= s.minSalary && gross <= s.maxSalary);
            if (slab && slab.taxAmount > 0) {
                processedDeductions.push({ name: 'Professional Tax', amount: slab.taxAmount });
            }
        }

        // --- 3. Income Tax (TDS) Calculation ---
        try {
            // Determine Financial Year
            const currentYear = parseInt(year);
            const currentMonth = parseInt(month);
            const fyStart = currentMonth > 3 ? currentYear : currentYear - 1;
            const financialYear = `${fyStart}-${fyStart + 1}`;

            // Fetch Declaration
            const declaration = await TaxDeclaration.findOne({
                employee: emp._id,
                financialYear
            });

            // Project Annual Salary (Simple Projection for Demo: Gross * 12)
            // In real world: YTD Earnings + Current Gross + (Remaining Months * Current Gross)
            const projectedAnnualGross = gross * 12;

            // Prepare Declaration Data
            const declarations = {
                section80C: declaration?.section80C?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0,
                section80D: declaration?.section80D?.amount || 0,
                hra: declaration?.hra?.rentAmount || 0, // Need accurate HRA calc details
                other: 0
            };

            // Calculate Annual Tax
            const annualTax = calculateTax(projectedAnnualGross, emp.taxRegime || 'New', declarations);

            // Calculate Monthly TDS (Simple: Annual / 12)
            // Ideally: (Annual Tax - Tax Paid YTD) / Remaining Months
            const monthlyTDS = Math.round(annualTax / 12);

            if (monthlyTDS > 0) {
                processedDeductions.push({ name: 'Income Tax (TDS)', amount: monthlyTDS });
            }

        } catch (taxError) {
            console.error('Tax Calculation Error:', taxError);
        }

        // Sum Deductions
        const totalDeductions = processedDeductions.reduce((sum, d) => sum + d.amount, 0);
        const netSalary = gross - totalDeductions;

        // Save/Update Payroll Record
        const payroll = await Payroll.findOneAndUpdate(
            { employee: emp._id, month, year },
            {
                organization,
                employee: emp._id,
                month,
                year,
                workingDays,
                presentDays: paidDays,
                lopDays,
                overtimeHours: totalOvertimeHours,
                earnings: processedEarnings,
                deductions: processedDeductions,
                grossSalary: gross,
                overtimePay,
                totalDeductions,
                netSalary,
                status: 'Draft'
            },
            { upsert: true, new: true }
        );
        results.push(payroll);
    }

    // Create Audit Log
    await logAction({
        userId,
        role: 'Payroll Admin',
        action: 'Processed Payroll',
        description: `Processed payroll for ${month}/${year} - ${results.length} employees`,
        ip: ip
    });

    res.json({ message: 'Payroll processed successfully', count: results.length, data: results });
};

// @desc    Get Payroll Records
// @route   GET /api/payroll
// @access  Private
const getPayroll = async (req, res) => {
    const { month, year } = req.query;
    const payrolls = await Payroll.find({ organization: req.user.organization, month, year })
        .populate('employee'); // Populate employee name
    res.json(payrolls);
};

// @desc    Approve/Finalize Payroll
// @route   PUT /api/payroll/approve
// @access  Private
const approvePayroll = async (req, res) => {
    const { month, year } = req.body;
    await Payroll.updateMany(
        { organization: req.user.organization, month, year },
        { status: 'Approved' }
    );

    // Notify all employees
    await notifyAllEmployees(`Payroll for ${month}/${year} has been approved and is ready for viewing.`, 'success');

    // Log action
    await logAction({
        userId: req.user._id,
        role: req.user.role,
        action: 'Approved Payroll',
        description: `Approved payroll for ${month}/${year}`,
        ip: req.ip
    });

    res.json({ message: 'Payroll approved for period' });
};

// @desc    Unlock/Revert Payroll to Draft
// @route   PUT /api/payroll/unlock
// @access  Private (Admin)
const unlockPayroll = async (req, res) => {
    const { month, year } = req.body;
    await Payroll.updateMany(
        { organization: req.user.organization, month, year },
        { status: 'Draft' }
    );

    // Log action
    await logAction({
        userId: req.user._id,
        role: req.user.role,
        action: 'Unlocked Payroll',
        description: `Unlocked payroll for ${month}/${year}`,
        ip: req.ip
    });

    res.json({ message: 'Payroll unlocked. Status reverted to Draft.' });
};

// @desc    Mark Payroll as Paid (Disburse)
// @route   PUT /api/payroll/disburse
// @access  Private (Finance/Admin)
const disbursePayroll = async (req, res) => {
    const { month, year, paymentDate, transactionId } = req.body;

    if (!month || !year) {
        return res.status(400).json({ message: 'Month and Year are required' });
    }

    // Mark status as Paid
    const result = await Payroll.updateMany(
        { organization: req.user.organization, month, year, status: 'Approved' },
        {
            status: 'Paid',
            paymentDate: paymentDate || new Date(),
            transactionId: transactionId || `TXN-${Date.now()}`
        }
    );

    if (result.modifiedCount === 0) {
        return res.status(404).json({ message: 'No approved payroll records found to disburse' });
    }

    // Notify employees
    await notifyAllEmployees(`Salary for ${month}/${year} has been disbursed! Check your bank account.`, 'success');

    // Log action
    await logAction({
        userId: req.user._id,
        role: req.user.role,
        action: 'Disbursed Payroll',
        description: `Disbursed salaries for ${month}/${year} - ${result.modifiedCount} employees`,
        ip: req.ip
    });

    res.json({ message: `Successfully disbursed salaries for ${result.modifiedCount} employees` });
};

module.exports = { runPayroll, getPayroll, approvePayroll, unlockPayroll, disbursePayroll };
