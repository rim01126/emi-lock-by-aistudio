import React, { useState } from 'react';
import { Customer, Loan, Payment, Installment, Shop } from '../types';
import { IndianRupee, CreditCard, Calendar, UserCheck, Plus, FileSpreadsheet, AlertTriangle, CheckSquare, UploadCloud, Edit3, ShieldAlert } from 'lucide-react';

interface PaymentsTabProps {
  shop: Shop;
  loans: Loan[];
  customers: Customer[];
  payments: Payment[];
  installments: Installment[];
  onAddPayment: (loanId: string, amount: number, method: 'cash' | 'upi' | 'bank_transfer', screenshotUrl?: string) => void;
  onEditPayment: (paymentId: string, updatedAmount: number) => void;
}

export default function PaymentsTab({
  shop,
  loans,
  customers,
  payments,
  installments,
  onAddPayment,
  onEditPayment,
}: PaymentsTabProps) {
  
  // Navigation
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [showPromiseForm, setShowPromiseForm] = useState(false);

  // Form states: add payment
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'bank_transfer'>('upi');
  const [screenshotUrl, setScreenshotUrl] = useState('');

  // Form states: edit payment
  const [editedAmount, setEditedAmount] = useState('');

  // Form states: Promise to pay
  const [promiseCustomerName, setPromiseCustomerName] = useState('');
  const [promiseAmount, setPromiseAmount] = useState('');
  const [promiseDate, setPromiseDate] = useState('2026-06-01');
  const [promiseNote, setPromiseNote] = useState('');
  const [promiseLogs, setPromiseLogs] = useState<{ id: string; name: string; amt: number; date: string; note: string; status: string }[]>([
    { id: 'prm-1', name: 'Harshil Vasoya', amt: 2300, date: '2026-06-15', note: 'Will transfer via GPay post salary credit', status: 'pending' },
    { id: 'prm-2', name: 'Manoj Ghadiya', amt: 1000, date: '2026-05-29', note: 'Arranging cash from cousin', status: 'pending' }
  ]);

  // Filter current active shop data
  const shopLoans = loans.filter(l => l.shopId === shop.id);
  const shopPayments = payments.filter(p => {
    const loan = loans.find(l => l.id === p.loanId);
    return loan && loan.shopId === shop.id;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanId) {
      alert("Error: Please select an active EMI account.");
      return;
    }
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Error: Payment amount must be a clean positive number.");
      return;
    }
    
    onAddPayment(selectedLoanId, amt, paymentMethod, screenshotUrl || undefined);
    
    // reset form
    setSelectedLoanId('');
    setPaymentAmount('');
    setScreenshotUrl('');
    setShowAddPaymentForm(false);
    alert("✅ Installment Payment logged successfully! Audit receipts are dispatched.");
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPaymentId) return;
    const amt = parseFloat(editedAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Invalid: please enter a numeric amount.");
      return;
    }

    onEditPayment(editingPaymentId, amt);
    setEditingPaymentId(null);
    setEditedAmount('');
    alert("⚠️ Security Audit Flag: Payment amount updated. Log recorded in shops auditing registers.");
  };

  const handlePromiseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promiseCustomerName || !promiseAmount) {
      alert("Please fill necessary promise info.");
      return;
    }
    const amt = parseFloat(promiseAmount);
    const newPromise = {
      id: `prm-${Date.now()}`,
      name: promiseCustomerName,
      amt: isNaN(amt) ? 0 : amt,
      date: promiseDate,
      note: promiseNote,
      status: 'pending'
    };

    setPromiseLogs([newPromise, ...promiseLogs]);
    setPromiseCustomerName('');
    setPromiseAmount('');
    setPromiseNote('');
    setShowPromiseForm(false);
    alert(`📅 Recorded official payment promise! Overdue reminders temporarily paused for this customer.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Headers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-sans">Payment Ledger & Receipts</h2>
          <p className="text-zinc-500 text-xs">Record installments, upload UPI screenshots, and manage customer payment promises</p>
        </div>

        <div className="flex gap-2 text-xs">
          <button
            onClick={() => { setShowAddPaymentForm(!showAddPaymentForm); setShowPromiseForm(false); }}
            className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Installment Receipt
          </button>
          
          <button
            onClick={() => { setShowPromiseForm(!showPromiseForm); setShowAddPaymentForm(false); }}
            className="bg-zinc-900 hover:bg-zinc-800 text-indigo-400 border border-zinc-800 font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            Promise to Pay System
          </button>
        </div>
      </div>

      {/* RECORD NEW INSTALLMENT RECEIPT */}
      {showAddPaymentForm && (
        <form onSubmit={handleAddSubmit} className="bg-slate-900/60 border border-slate-850 p-6 rounded-3xl space-y-4 animate-fade-in">
          <div className="border-b border-zinc-800 pb-2.5">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4.5 h-4.5 text-indigo-400" />
              Log customer Installment Receipt
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Select Target loan */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono text-zinc-500 font-bold">Select Active Account *</label>
              <select
                required
                value={selectedLoanId}
                onChange={(e) => setSelectedLoanId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs text-zinc-150 outline-none focus:border-indigo-650"
              >
                <option value="">-- Choose Customer --</option>
                {shopLoans.map(loan => {
                  const cust = customers.find(c => c.id === loan.customerId);
                  return (
                    <option key={loan.id} value={loan.id}>
                      {cust?.name || 'Unknown'} (Overdue: ₹{loan.monthlyEmiAmount} - Bal: ₹{loan.remainingAmount})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Amount input */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono text-zinc-500 font-bold">Receipt Amount (INR) *</label>
              <input
                type="number"
                required
                placeholder="e.g. 2100"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-indigo-650 font-mono"
              />
            </div>

            {/* Method options */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono text-zinc-500 font-bold">Transaction Medium</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs text-white outline-none"
              >
                <option value="upi">GPay / PhonePe / Paytm (UPI)</option>
                <option value="cash">Hard Cash Receipt</option>
                <option value="bank_transfer">IMPS/NEFT Bank Transfer</option>
              </select>
            </div>

            {/* Simulated UPI Screenshot */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono text-zinc-500 font-bold">UPI Screenshot Simulator</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste URL or auto mock"
                  value={screenshotUrl}
                  onChange={(e) => setScreenshotUrl(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-[10.5px] text-zinc-300 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setScreenshotUrl('https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?auto=format&fit=crop&q=80&w=300')}
                  className="bg-zinc-800 text-[10px] font-bold text-zinc-400 border border-zinc-800 px-3 rounded-xl flex items-center gap-1 shrink-0"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  Mock Slip
                </button>
              </div>
            </div>

          </div>

          <div className="text-right pt-2 border-t border-zinc-800">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-5 rounded-xl transition-all"
            >
              Confirm Cleared Payment
            </button>
          </div>
        </form>
      )}

      {/* PAYMENT EDIT DIA LOG (REPRESENTING COMPLIANT RLS AUDITING WRITE CONTROLS) */}
      {editingPaymentId && (
        <form onSubmit={handleEditSubmit} className="bg-slate-900 border border-amber-900/60 p-5 rounded-3xl space-y-4 animate-fade-in relative z-20">
          <div className="absolute right-0 top-0 w-44 h-44 bg-amber-500/5 filter blur-3xl rounded-full" />
          
          <div className="flex items-center gap-2 text-amber-500 border-b border-zinc-800 pb-2.5">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <div>
              <h3 className="font-bold text-white text-xs">Supabase Secure Payment Modification</h3>
              <p className="text-[9.5px] text-zinc-500 uppercase font-mono">Modifying financial registers automatically leaves permanent audit entries</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono text-zinc-500 font-bold block">Corrected Amount (INR) *</label>
              <input
                type="number"
                required
                placeholder="Enter revised cash amount"
                value={editedAmount}
                onChange={(e) => setEditedAmount(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-amber-500 font-mono"
              />
            </div>
            
            <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
              *RULE: Submitting this edit alerts the primary store owner profile. Auditing details will contain your login email profile, action timestamps, and old value markers.
            </p>
          </div>

          <div className="flex justify-end gap-2 text-xs pt-2">
            <button
              type="button"
              onClick={() => setEditingPaymentId(null)}
              className="text-zinc-500 hover:text-white px-3.5 py-1.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-1.5 rounded-lg"
            >
              Acknowledge Audit & Submit Edit
            </button>
          </div>
        </form>
      )}

      {/* PROMISE TO PAY FORM */}
      {showPromiseForm && (
        <form onSubmit={handlePromiseSubmit} className="bg-slate-900/60 border border-slate-850 p-6 rounded-3xl space-y-4 animate-fade-in">
          <div className="border-b border-zinc-800 pb-2.5">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-indigo-400" />
              Log Formal Payment Promise Pledge
            </h3>
            <p className="text-zinc-500 text-[10px] mt-0.5">Locks temporary reminder loops based on mutual merchant agreement</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono text-zinc-500">Customer Name *</label>
              <input
                type="text"
                required
                placeholder="Ramesh Patel"
                value={promiseCustomerName}
                onChange={(e) => setPromiseCustomerName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono text-zinc-500">Settlement Amount *</label>
              <input
                type="number"
                required
                placeholder="2100"
                value={promiseAmount}
                onChange={(e) => setPromiseAmount(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs text-white outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono text-zinc-500">Proposed Clearance Date *</label>
              <input
                type="date"
                required
                value={promiseDate}
                onChange={(e) => setPromiseDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs text-white outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono text-zinc-500">Remark / Notes</label>
              <input
                type="text"
                placeholder="Arranging money from shop salary"
                value={promiseNote}
                onChange={(e) => setPromiseNote(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs text-white outline-none font-sans"
              />
            </div>

          </div>

          <div className="text-right pt-2 border-t border-zinc-800">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-5 rounded-xl transition-all animate-pulse"
            >
              Log Promise parameters
            </button>
          </div>
        </form>
      )}

      {/* Grid: Left side list of cleared payments, Right side payment promise ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Payments ledger list */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-wide">Historical Transaction Receipts</h3>
            <p className="text-zinc-500 text-[10px] mt-0.5">Real-time registers of cash, UPI, and bank collections cleared</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-350">
              <thead className="bg-zinc-950 text-zinc-500 uppercase tracking-widest text-[9px] border-b border-zinc-805 font-mono">
                <tr>
                  <th className="p-3">Receipt Ref</th>
                  <th className="p-3">Account Loan</th>
                  <th className="p-3">Medium</th>
                  <th className="p-3 text-right">Cleared Amount</th>
                  <th className="p-3 text-center">Receipt Slip</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {shopPayments.map((pmt) => {
                  const loanDef = loans.find(l => l.id === pmt.loanId);
                  const custDef = loanDef ? customers.find(c => c.id === loanDef.customerId) : null;

                  return (
                    <tr key={pmt.id} className="hover:bg-zinc-90 w-full transition-colors font-sans">
                      <td className="p-3 font-mono">
                        <span className="font-semibold text-zinc-400">{pmt.receiptNumber}</span>
                        <p className="text-[9px] text-zinc-500 mt-0.5">{new Date(pmt.paymentDate).toLocaleDateString()}</p>
                      </td>
                      <td className="p-3 font-semibold text-white">
                        {custDef?.name || 'Generic Ledger'}
                        <p className="text-[9.5px] text-zinc-500 font-normal truncate max-w-32">{custDef?.phone}</p>
                      </td>
                      <td className="p-3">
                        <span className="text-[10px] uppercase font-semibold font-mono tracking-wide text-zinc-400">
                          {pmt.paymentMethod}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-white">
                        ₹{pmt.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-center">
                        {pmt.screenshotUrl ? (
                          <button
                            onClick={() => alert(`Opening simulated transaction screenshot:\n${pmt.screenshotUrl}`)}
                            className="bg-zinc-950 p-1 rounded hover:border-zinc-700 hover:bg-zinc-900 border border-zinc-850 inline-block text-[9.5px] font-mono text-indigo-400"
                          >
                            🔬 View Slip
                          </button>
                        ) : (
                          <span className="text-zinc-650 font-mono text-[10px]">No attachment</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setEditingPaymentId(pmt.id);
                            setEditedAmount(pmt.amount.toString());
                          }}
                          className="bg-zinc-950 hover:bg-zinc-900 text-zinc-400 text-[10px] px-2 py-1 rounded-lg border border-zinc-850 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3 text-zinc-550" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {shopPayments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-650 italic font-medium font-sans">
                      No monetary ledger receipts found for this shop. Add standard invoices using commands above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right side: formal promise pay list */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 col-span-1 space-y-4">
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-wide">Pledge Accounts (Promises to Pay)</h3>
            <p className="text-zinc-500 text-[10px] mt-0.5">Mutual merchant agreement logs with selected due dates</p>
          </div>

          <div className="space-y-3.5">
            {promiseLogs.map((item) => (
              <div key={item.id} className="bg-zinc-950 p-4.5 rounded-2xl border border-zinc-850/80 relative overflow-hidden font-sans">
                <div className="absolute right-1 top-1 text-[8.5px] uppercase font-mono font-black tracking-wide text-rose-500 bg-rose-950/40 px-1 rounded border border-rose-900/20">
                  {item.status}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 font-mono">Customer Name:</span>
                  <h4 className="font-bold text-white text-[12.5px]">{item.name}</h4>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-xs border-t border-zinc-900 pt-2.5">
                  <div>
                    <span className="text-[9.5px] text-zinc-500 font-mono block">Target Amount</span>
                    <span className="font-mono font-bold text-emerald-400 text-[11.5px]">₹{item.amt.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-zinc-500 font-mono block">Proposed Date</span>
                    <span className="font-mono font-bold text-white text-[11px]">{item.date}</span>
                  </div>
                </div>

                <p className="text-[10px] text-zinc-400 mt-2.5 leading-snug bg-zinc-900/60 p-2 rounded-xl border border-zinc-850/30 italic">
                  "{item.note}"
                </p>

                <div className="mt-3.5 text-right">
                  <button
                    onClick={() => {
                      setPromiseLogs(promiseLogs.filter(p => p.id !== item.id));
                      alert(`🎉 Settled pledge promise for "${item.name}"! Overdue metrics returned to original values.`);
                    }}
                    className="bg-emerald-650 hover:bg-emerald-700 text-white font-bold text-[9px] px-2.5 py-1 rounded-lg tracking-tight inline-block cursor-pointer"
                  >
                    Mark Settled
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
