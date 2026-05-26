import React from 'react';
import { Customer, Device, Loan, Payment, Installment, Shop, IntegrityAlert } from '../types';
import { IndianRupee, ShieldAlert, CheckCircle, Smartphone, AlertOctagon, TrendingUp, UserCheck, ShieldOff } from 'lucide-react';

interface OverviewTabProps {
  shop: Shop;
  customers: Customer[];
  devices: Device[];
  loans: Loan[];
  payments: Payment[];
  installments: Installment[];
  integrityAlerts: IntegrityAlert[];
  onSelectCustomer: (cust: Customer) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function OverviewTab({
  shop,
  customers,
  devices,
  loans,
  payments,
  installments,
  integrityAlerts,
  onSelectCustomer,
  onNavigateToTab,
}: OverviewTabProps) {
  // Filter core data by current shopId
  const shopCustomers = customers.filter(c => c.shopId === shop.id);
  const shopDevices = devices.filter(d => d.shopId === shop.id);
  const shopLoans = loans.filter(l => l.shopId === shop.id);
  
  const totalLoanValue = shopLoans.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalReceived = shopLoans.reduce((acc, curr) => acc + curr.downPayment + (curr.totalAmount - curr.remainingAmount - curr.downPayment), 0);
  const totalOutstanding = shopLoans.reduce((acc, curr) => acc + curr.remainingAmount, 0);

  // Overdue and locks metrics
  const activeDevices = shopDevices.filter(d => d.isActive).length;
  const lockedDevices = shopDevices.filter(d => d.isLocked).length;
  const overdueLoansCount = shopLoans.filter(l => l.status === 'overdue').length;

  // Recovery Rate
  const totalEmiDueValue = installments
    .filter(i => {
      const loan = loans.find(l => l.id === i.loanId);
      return loan && loan.shopId === shop.id && (i.status === 'paid' || i.status === 'partially_paid' || i.status === 'overdue');
    })
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalEmiReceivedValue = installments
    .filter(i => {
      const loan = loans.find(l => l.id === i.loanId);
      return loan && loan.shopId === shop.id;
    })
    .reduce((acc, curr) => acc + curr.amountPaid, 0);

  const recoveryRate = totalEmiDueValue > 0 
    ? Math.round((totalEmiReceivedValue / totalEmiDueValue) * 100) 
    : 100;

  // Integrity alerts count
  const shopAlerts = integrityAlerts.filter(a => {
    const dev = devices.find(d => d.id === a.deviceId);
    return dev && dev.shopId === shop.id;
  });

  // Calculate dynamic weekly collection metric (simulation)
  const collectionTarget = totalOutstanding * 0.15 || 50000;
  const collectionCollected = shopLoans.reduce((score, l) => {
    const paymentsForLoan = payments.filter(p => p.loanId === l.id);
    return score + paymentsForLoan.reduce((sum, p) => sum + p.amount, 0);
  }, 0) % collectionTarget;

  return (
    <div className="space-y-6">
      
      {/* Top Banner Row */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-600/10 rounded-full filter blur-3xl translate-x-20 -translate-y-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-indigo-400 tracking-widest uppercase font-mono font-bold block">Live Multi-Shop Terminal</span>
            <h1 className="text-2xl font-bold tracking-tight text-white">{shop.name}</h1>
            <p className="text-zinc-400 text-xs">
              Registered GST: <span className="font-mono text-zinc-150">{shop.gstNumber}</span> • Support Contact: <span className="text-zinc-150">{shop.supportNumber}</span>
            </p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => onNavigateToTab('customers')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20"
            >
              + Quick Enroll
            </button>
            <button 
              onClick={() => onNavigateToTab('guides')}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
            >
              DPC Provisioning Guides
            </button>
          </div>
        </div>
      </div>

      {/* Grid statistics metrics columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI: Outstanding portfolio */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-slate-700 transition-all shadow-sm">
          <div className="space-y-1">
            <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase font-bold">EMI Outstanding</p>
            <h3 className="text-xl font-bold tracking-tight text-white flex items-center">
              <IndianRupee className="w-4 h-4 text-emerald-400 mr-0.5 shrink-0" />
              {totalOutstanding.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] text-zinc-400">Total Book Value: ₹{totalLoanValue.toLocaleString('en-IN')}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-900 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Active devices count */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-slate-700 transition-all shadow-sm">
          <div className="space-y-1">
            <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase font-bold">Active Devices</p>
            <h3 className="text-xl font-bold tracking-tight text-white">
              {activeDevices} <span className="text-xs text-zinc-500 font-normal">Registered</span>
            </h3>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              All synchronization live
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-sky-950 border border-sky-900 flex items-center justify-center text-sky-400">
            <Smartphone className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Locked Overdue devices count */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-slate-700 transition-all shadow-sm">
          <div className="space-y-1">
            <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase font-bold">LOCKED DEVICES</p>
            <h3 className={`text-xl font-bold tracking-tight ${lockedDevices > 0 ? 'text-rose-500' : 'text-zinc-350'}`}>
              {lockedDevices} <span className="text-xs text-zinc-500 font-normal">Active Blocks</span>
            </h3>
            <p className="text-[10px] text-zinc-400 font-mono">Total Overdue Loans: {overdueLoansCount}</p>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${lockedDevices > 0 ? 'bg-rose-950/70 border-rose-900 text-rose-400' : 'bg-zinc-950 border-zinc-900 text-zinc-550'}`}>
            <ShieldOff className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Tamper security alerts count */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-slate-700 transition-all shadow-sm">
          <div className="space-y-1">
            <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase font-bold">TAMPER DETECTED</p>
            <h3 className={`text-xl font-bold tracking-tight ${shopAlerts.length > 0 ? 'text-amber-500' : 'text-zinc-350'}`}>
              {shopAlerts.length} <span className="text-xs text-zinc-500 font-normal">Critical Logs</span>
            </h3>
            <p className="text-[10px] text-zinc-400 font-mono">Anti-Uninstall enforced</p>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${shopAlerts.length > 0 ? 'bg-amber-950 border-amber-900 text-amber-400 animate-pulse' : 'bg-zinc-950 border-zinc-900 text-zinc-550'}`}>
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Charts and Recovery Rate section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Collection performance metrics */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Monthly Collection Efficiency</h3>
              <p className="text-zinc-500 text-[10.5px]">Receipt efficiency compared to predicted overdue amortizations</p>
            </div>
            
            <div className="flex gap-2 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Collected
              </span>
              <span className="flex items-center gap-1 text-indigo-500">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Remaining Overdue
              </span>
            </div>
          </div>

          <div className="space-y-4">
            
            {/* Custom Responsive Progress SVG representation */}
            <div className="relative h-44 w-full flex items-end justify-between px-4 pt-4 border-b border-zinc-800/80 bg-zinc-950/40 rounded-2xl relative">
              <div className="absolute inset-y-0 left-0 right-0 grid grid-rows-4 pointer-events-none select-none opacity-20 text-[8.5px] font-mono text-zinc-650 px-2">
                <span className="border-b border-zinc-700/50 pt-1">100% Target</span>
                <span className="border-b border-zinc-700/50 pt-1">75% Target</span>
                <span className="border-b border-zinc-700/50 pt-1">50% Target</span>
                <span className="border-b border-zinc-700/50 pt-1">25% Target</span>
              </div>

              {/* Monthly Visual Pillars */}
              {[
                { m: 'Jan', col: 90, target: 100 },
                { m: 'Feb', col: 85, target: 100 },
                { m: 'Mar', col: 95, target: 100 },
                { m: 'Apr', col: 72, target: 100 },
                { m: 'May (Current)', col: recoveryRate, target: 100 }
              ].map((pill, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 w-12 group relative z-10">
                  <div className="w-5 h-28 bg-zinc-850 rounded-t-lg relative overflow-hidden flex items-end">
                    {/* Remaining Target Shadow */}
                    <div className="absolute inset-0 bg-indigo-900/30 w-full" style={{ height: `${pill.target}%` }} />
                    {/* Collected block */}
                    <div 
                      className="bg-indigo-600 group-hover:bg-indigo-500 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all w-full rounded-t-sm" 
                      style={{ height: `${pill.col}%` }} 
                    />
                  </div>
                  <span className="text-[10px] font-medium text-zinc-400 group-hover:text-white transition-colors">{pill.m}</span>
                  <div className="absolute opacity-0 group-hover:opacity-100 bg-slate-900 border border-slate-705 p-1.5 rounded-md -top-12 z-20 shadow-lg text-[9px] pointer-events-none transition-opacity whitespace-nowrap text-center">
                    <p className="font-bold text-white">Efficiency: {pill.col}%</p>
                    <p className="text-zinc-400">Total Cleared</p>
                  </div>
                </div>
              ))}
            </div>

            {/* General progress indicators */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-850">
                <span className="text-[9.5px] text-zinc-500 uppercase tracking-widest font-mono">Portfolio At Risk (PAR)</span>
                <p className="text-sm font-bold text-rose-400 mt-1">{Math.round((overdueLoansCount / (shopLoans.length || 1)) * 100)}%</p>
              </div>
              <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-850">
                <span className="text-[9.5px] text-zinc-500 uppercase tracking-widest font-mono">LTV Ratio Allowed</span>
                <p className="text-sm font-bold text-zinc-200 mt-1">70% MAX</p>
              </div>
              <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-850">
                <span className="text-[9.5px] text-zinc-500 uppercase tracking-widest font-mono">Average Resolution</span>
                <p className="text-sm font-bold text-emerald-400 mt-1">1.8 Days</p>
              </div>
            </div>

          </div>
        </div>

        {/* Circular gauge / recovery score sidebar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Active Recovery Score</h3>
            <p className="text-zinc-500 text-[10.5px]">Real-time ratio of collected EMIs vs total overdue liabilities</p>
          </div>

          {/* SVG Pie Circular Gauge */}
          <div className="relative w-36 h-36 mx-auto my-4 flex items-center justify-center">
            {/* SVG circle logic */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Slate Base Circle path */}
              <circle 
                cx="50" cy="50" r="40" 
                className="stroke-zinc-850" 
                strokeWidth="8" fill="transparent" 
              />
              {/* Dynamic Indigo value stroke */}
              <circle 
                cx="50" cy="50" r="40" 
                className="stroke-indigo-650" 
                strokeWidth="8" fill="transparent" 
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - recoveryRate / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-black text-white font-mono">{recoveryRate}%</span>
              <p className="text-[9px] text-emerald-400 uppercase font-mono tracking-wider">ON TIME RATE</p>
            </div>
          </div>

          <div className="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-850 space-y-2.5">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-zinc-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Installments Cleared:
              </span>
              <span className="font-mono text-zinc-200">
                ₹{totalEmiReceivedValue.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between items-center text-[10px] border-t border-zinc-900 pt-2">
              <span className="text-zinc-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                Remaining Target:
              </span>
              <span className="font-mono text-indigo-400">
                ₹{(totalEmiDueValue - totalEmiReceivedValue).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Risky Accounts Ledger */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Risky Accounts Alert Drawer</h3>
            <p className="text-zinc-500 text-[10.5px]">Customers with payments overdue or offline tamper events triggered</p>
          </div>
          <span className="text-[10px] font-mono text-rose-400 font-bold px-2 py-0.5 bg-rose-950 border border-rose-900 rounded">
            Immediate Followup Needed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-350">
            <thead className="bg-zinc-950/90 text-zinc-500 uppercase tracking-widest text-[9.5px] border-b border-zinc-800/80 font-mono">
              <tr>
                <th className="p-3">Customer</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Device Model</th>
                <th className="p-3">EMI Status</th>
                <th className="p-3 text-right">Overdue Balance</th>
                <th className="p-3 text-center">Tamper Flag</th>
                <th className="p-3 text-right">Action Interface</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {shopLoans.filter(l => l.status === 'overdue').map((loanItem) => {
                const customerDef = shopCustomers.find(c => c.id === loanItem.customerId);
                const deviceDef = shopDevices.find(d => d.id === loanItem.deviceId);
                const hasAlert = shopAlerts.some(a => a.deviceId === loanItem.deviceId);
                
                if (!customerDef) return null;

                return (
                  <tr key={loanItem.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="p-3 font-semibold text-white flex items-center gap-2">
                      <img 
                        src={customerDef.avatarUrl} 
                        alt="Avatar" 
                        className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700"
                        referrerPolicy="no-referrer"
                      />
                      {customerDef.name}
                    </td>
                    <td className="p-3 font-mono">{customerDef.phone}</td>
                    <td className="p-3 text-zinc-400">{deviceDef?.model || 'Generic Android'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-rose-950 border border-rose-900 rounded-md text-[9.5px] font-semibold text-rose-450 uppercase tracking-wide">
                        Overdue ({Math.abs(new Date(loanItem.nextDueDate).getDate() - 26)} Days)
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-white">
                      ₹{loanItem.monthlyEmiAmount}
                    </td>
                    <td className="p-3 text-center">
                      {hasAlert ? (
                        <span className="inline-flex items-center gap-1 bg-amber-950/70 border border-amber-950 text-amber-500 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono animate-pulse">
                          ⚠️ ALARM
                        </span>
                      ) : (
                        <span className="text-zinc-650 font-mono text-[10.5px]">Secure</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onSelectCustomer(customerDef)}
                        className="bg-indigo-600/10 hover:bg-indigo-650 border border-indigo-900 text-indigo-400 hover:text-white px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all inline-block text-center cursor-pointer"
                      >
                        Inspect Device
                      </button>
                    </td>
                  </tr>
                );
              })}
              {shopLoans.filter(l => l.status === 'overdue').length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-550 font-medium font-sans">
                    ✨ Splendid! Zero overdues. All customer installments synchronized securely within grace parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
