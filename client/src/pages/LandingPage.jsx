import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiShield, FiZap, FiMenu, FiX } from 'react-icons/fi';
import dashboardPreview from '../assets/dashboard-preview.png';
import AttendanceManagement from '../assets/AttendanceManagement.png';
import PayrollApproval from '../assets/PayrollApproval.png';
import EmployeeProfileManagement from '../assets/EmployeeProfileManagement.png';


const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center transform group-hover:rotate-6 transition-transform">
            <span className="text-white font-black text-2xl">P</span>
          </div>
          <span className="font-black text-2xl tracking-tighter text-slate-900 uppercase">
            Payroll<span className="text-blue-600">Pro</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-10 font-bold text-slate-500 text-sm uppercase tracking-widest">
          <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          <a href="#solutions" className="hover:text-blue-600 transition-colors">Solutions</a>
          <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="hidden sm:block px-6 py-2.5 text-slate-700 font-bold hover:text-blue-600 transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="px-8 py-3 bg-blue-600 text-white rounded-full font-black shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm uppercase tracking-wider">
            Get Started
          </Link>
          <button className="lg:hidden text-slate-900 p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-slate-100 p-6 flex flex-col gap-6 lg:hidden animate-in fade-in slide-in-from-top-4">
            <a href="#features" className="font-bold text-slate-600" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#solutions" className="font-bold text-slate-600" onClick={() => setIsMenuOpen(false)}>Solutions</a>
            <a href="#pricing" className="font-bold text-slate-600" onClick={() => setIsMenuOpen(false)}>Pricing</a>
            <Link to="/login" className="font-bold text-blue-600" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative pt-40 pb-24 px-6 md:px-12 overflow-hidden text-center">
        {/* Soft Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] aspect-square bg-blue-50/40 rounded-full blur-[120px] -z-10 -translate-y-1/2"></div>

        <div className="max-w-5xl mx-auto space-y-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black tracking-[0.2em] uppercase border border-blue-100 shadow-sm animate-bounce-slow">
            <FiZap className="w-4 h-4" /> The New Standard in Payroll
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tight leading-[0.95] animate-in fade-in slide-in-from-bottom-10 duration-700">
            Payroll made <span className="text-blue-600 relative">easy, <span className="absolute -bottom-2 left-0 w-full h-3 bg-blue-100 -z-10 rotate-1"></span></span> scalable, and compliant.
          </h1>

          <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000">
            Transform outdated payroll practices and build a better workplace for your business with PayrollPro. Automate calculations, manage compliance, and delight your team.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-8 animate-in fade-in slide-in-from-bottom-14 duration-1000">
            <Link to="/register" className="group px-12 py-6 bg-blue-600 text-white rounded-2xl text-lg font-black shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1.5 active:translate-y-0 transition-all flex items-center gap-3">
              Start My Free Trial <FiArrowRight size={22} className="group-hover:translate-x-1.5 transition-transform" />
            </Link>
            <button className="px-12 py-6 bg-white text-slate-900 border-2 border-slate-200 rounded-2xl text-lg font-black hover:border-blue-600 hover:text-blue-600 hover:-translate-y-1.5 active:translate-y-0 transition-all shadow-lg shadow-slate-100">
              Request a demo
            </button>
          </div>
        </div>

        {/* Main Hero Preview */}
        <div className="mt-24 max-w-6xl mx-auto relative group animate-in fade-in zoom-in duration-1000 delay-300">
          <div className="absolute -inset-10 bg-gradient-to-r from-blue-200 via-white to-blue-100 rounded-[4rem] blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-white p-3 md:p-5 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 transform hover:-translate-y-2 transition-all duration-700">
            <div className="bg-slate-50 rounded-[1.5rem] border border-slate-200 overflow-hidden shadow-inner aspect-[16/10] flex items-center justify-center">
              <img
                src={dashboardPreview}
                alt="PayrollPro Dashboard Mockup"
                className="w-full h-full object-contain transform scale-105 group-hover:scale-100 transition-transform duration-1000"
              />
            </div>

            {/* Floating UI Elements Mockup */}
            <div className="absolute -right-6 top-1/4 bg-white p-6 rounded-2xl shadow-2xl border border-slate-100 hidden lg:block animate-bounce-slow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">✓</div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Payroll Approved</p>
                  <p className="text-xs text-slate-500">May 2024 processed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Platform Showcase */}
      <section id="solutions" className="py-32 px-6 md:px-12 bg-slate-50/30">
        <div className="max-w-7xl mx-auto space-y-32">
          
          {/* Feature 1: Admin Dashboard */}
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8 animate-in slide-in-from-left-10 duration-700">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200">
                <FiZap size={32} />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Centralized <span className="text-blue-600">Admin</span> Control Center.
              </h2>
              <p className="text-xl text-slate-500 leading-relaxed font-medium">
                Comprehensive company-wide monitoring. Track payroll cycles, employee distribution, and statutory compliance status in real-time with an intuitive dashboard designed for speed and clarity.
              </p>
              <ul className="space-y-4">
                {["Real-time Payroll Analytics", "Compliance Health Score", "Employee Growth Tracking"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-bold text-slate-700">
                    <FiCheckCircle className="text-blue-600" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative group">
              <div className="absolute -inset-6 bg-blue-100 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
              <div className="relative bg-white p-4 rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden transform group-hover:-translate-y-2 transition-all duration-500">
                <img src={dashboardPreview} alt="Super Admin Dashboard" className="w-full rounded-2xl shadow-inner" />
              </div>
            </div>
          </div>

          {/* Feature 2: Attendance Management */}
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="lg:order-2 space-y-8 animate-in slide-in-from-right-10 duration-700">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-200">
                <FiCheckCircle size={32} />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Smart <span className="text-emerald-600">Attendance</span> Tracking.
              </h2>
              <p className="text-xl text-slate-500 leading-relaxed font-medium">
                Intelligent attendance monitoring. Manage daily logs, mark holidays for the entire team, and automatically calculate Loss of Pay (LOP) based on precise real-time attendance data.
              </p>
              <ul className="space-y-4">
                {["Automated LOP Calculations", "Bulk Holiday Marking", "Daily Attendance Reports"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-bold text-slate-700">
                    <FiCheckCircle className="text-emerald-600" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:order-1 relative group">
              <div className="absolute -inset-6 bg-emerald-100 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
              <div className="relative bg-white p-4 rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden transform group-hover:-translate-y-2 transition-all duration-500">
                <img src={AttendanceManagement} alt="Attendance Management" className="w-full rounded-2xl shadow-inner" />
              </div>
            </div>
          </div>

          {/* Feature 3: Run Payroll */}
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8 animate-in slide-in-from-left-10 duration-700">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200">
                <FiZap size={32} />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Bulk <span className="text-blue-600">Payroll</span> Processing.
              </h2>
              <p className="text-xl text-slate-500 leading-relaxed font-medium">
                Scale your payroll with ease. Automate complex calculations including ESI, PF, Professional Tax, and Income Tax (TDS) based on custom salary structures with single-click processing.
              </p>
              <ul className="space-y-4">
                {["One-Click Salary Generation", "Automated Tax Filings", "Detailed Cost Analytics"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-bold text-slate-700">
                    <FiCheckCircle className="text-blue-600" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative group">
              <div className="absolute -inset-6 bg-blue-100 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
              <div className="relative bg-white p-4 rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden transform group-hover:-translate-y-2 transition-all duration-500">
                <img src={PayrollApproval} alt="Payroll Processing" className="w-full rounded-2xl shadow-inner" />
              </div>
            </div>
          </div>

          {/* Feature 4: Employee View */}
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="lg:order-2 space-y-8 animate-in slide-in-from-right-10 duration-700">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200">
                <FiShield size={32} />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Employee <span className="text-blue-600">Self-Service</span> Portal.
              </h2>
              <p className="text-xl text-slate-500 leading-relaxed font-medium">
                Empower your workforce with transparency. A dedicated portal for employees to download payslips, manage their own tax declarations, and view their salary history independently.
              </p>
              <ul className="space-y-4">
                {["Digital Payslip Downloads", "Tax Declaration Management", "Salary Structure View"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-bold text-slate-700">
                    <FiCheckCircle className="text-blue-600" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:order-1 relative group">
              <div className="absolute -inset-6 bg-slate-200 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
              <div className="relative bg-white p-4 rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden transform group-hover:-translate-y-2 transition-all duration-500">
                <img src={EmployeeProfileManagement} alt="Employee Portal" className="w-full rounded-2xl shadow-inner" />
              </div>
            </div>
          </div>

        </div>
      </section>



      {/* Trust Badges / Stats */}
      <section className="py-20 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { value: "10,000+", label: "Happy Customers" },
            { value: "₹500Cr+", label: "Pay Disbursed" },
            { value: "99.9%", label: "Accuracy Rate" },
            { value: "24/7", label: "Expert Support" }
          ].map((stat, i) => (
            <div key={i} className="space-y-2">
              <p className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-32 px-6 md:px-12 bg-white relative">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-6">
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">Built for modern businesses.</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">Simple yet powerful. Manage everything from salaries to statutory compliance in one powerful platform.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: <FiZap className="w-10 h-10 text-blue-600" />, title: "Automated Pay Runs", desc: "Run your entire payroll in minutes. Automated calculations for allowances, deductions, and LOP based on attendance." },
              { icon: <FiShield className="w-10 h-10 text-amber-500" />, title: "Statutory Compliance", desc: "Never miss a deadline. Automatic PF, ESI, Professional Tax, and Income Tax (TDS) calculations built natively." },
              { icon: <FiCheckCircle className="w-10 h-10 text-emerald-500" />, title: "Employee Self-Service", desc: "Empower your team with a beautiful portal to download payslips, declare taxes, and track their own records." }
            ].map((feature, idx) => (
              <div key={idx} className="group p-12 bg-slate-50 rounded-[3rem] border border-slate-100 hover:border-blue-200 hover:shadow-[0_30px_60px_-15px_rgba(37,99,235,0.1)] hover:-translate-y-3 transition-all duration-500">
                <div className="mb-8 p-6 bg-white rounded-3xl w-fit shadow-xl shadow-slate-200/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">{feature.icon}</div>
                <h3 className="text-2xl font-black mb-4 text-slate-900">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto bg-slate-900 rounded-[4rem] p-12 md:p-24 text-center space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10 space-y-6">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight">Ready to transform your payroll?</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">Join thousands of companies who trust PayrollPro to handle their most important business process.</p>
            <div className="pt-10">
              <Link to="/register" className="px-16 py-7 bg-white text-slate-900 rounded-[2rem] text-xl font-black hover:bg-neutral-100 hover:-translate-y-1.5 active:translate-y-0 transition-all inline-block shadow-2xl">
                Start My Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-20 px-6 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="space-y-6 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-lg">P</span>
              </div>
              <span className="font-black text-xl tracking-tighter text-slate-900 uppercase">PayrollPro</span>
            </div>
            <p className="text-slate-400 font-bold text-sm tracking-wide">BUILDING THE FUTURE OF WORK.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-sm font-black text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Security</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-slate-50 text-center">
          <p className="text-slate-300 text-sm font-medium">© {new Date().getFullYear()} PayrollPro Systems. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
