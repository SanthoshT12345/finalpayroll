const Employee = require('../models/Employee');
const Payroll = require('../models/Payroll');
const SalaryStructure = require('../models/SalaryStructure');
const TaxDeclaration = require('../models/TaxDeclaration');

// @desc    Get Employee Payslips
// @route   GET /api/employee/payslips
// @access  Private (Employee only)
const getMyPayslips = async (req, res) => {
    try {
        const employee = await Employee.findOne({ user: req.user._id });
        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found' });
        }

        const payslips = await Payroll.find({ employee: employee._id })
            .sort({ year: -1, month: -1 });

        res.json(payslips);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Employee Salary Structure
// @route   GET /api/employee/salary-structure
// @access  Private (Employee only)
const getMySalaryStructure = async (req, res) => {
    try {
        // Populate nested component references so frontend gets component.name and component.type
        const employee = await Employee.findOne({ user: req.user._id }).populate({
            path: 'salaryStructure',
            populate: { path: 'components.component' }
        });
        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found' });
        }

        const structure = employee.salaryStructure;
        if (!structure) return res.json(null);

        // Ensure components have resolved values (use override value if provided, otherwise component default)
        const resolvedComponents = (structure.components || []).map(item => {
            const comp = item.component || {};
            const value = (typeof item.value === 'number' && !isNaN(item.value)) ? item.value : (comp.value || 0);
            return {
                component: comp,
                calculationType: item.calculationType,
                value
            };
        });

        // Compute monthly earnings (sum of Earning components) and annual CTC
        const monthlyEarnings = resolvedComponents.reduce((sum, it) => {
            return sum + ((it.component && it.component.type === 'Earning') ? (it.value || 0) : 0);
        }, 0);

        const totalCTC = monthlyEarnings * 12;

        // Return enriched structure object
        const out = {
            _id: structure._id,
            name: structure.name,
            description: structure.description,
            components: resolvedComponents,
            isActive: structure.isActive,
            totalCTC
        };

        res.json(out);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Employee Tax Details
// @route   GET /api/employee/tax-details
// @access  Private (Employee only)
const getMyTaxDetails = async (req, res) => {
    try {
        const employee = await Employee.findOne({ user: req.user._id });
        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found' });
        }

        const declaration = await TaxDeclaration.findOne({
            employee: employee._id,
            financialYear: '2024-2025' // Default or dynamic
        });

        res.json({
            taxRegime: employee.taxRegime,
            declaration
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getMyPayslips,
    getMySalaryStructure,
    getMyTaxDetails
};
