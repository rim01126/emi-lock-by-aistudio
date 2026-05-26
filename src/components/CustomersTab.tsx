import React, { useState } from 'react';
import { Customer, Device, Loan, Shop } from '../types';
import { User, Phone, MapPin, Tag, Smartphone, CheckSquare, Plus, Ban, Eye, Key, FileText, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';

interface CustomersTabProps {
  shop: Shop;
  customers: Customer[];
  devices: Device[];
  loans: Loan[];
  onAddCustomer: (customer: Customer, device: Device, loan: Loan) => void;
  onSelectCustomer: (cust: Customer) => void;
}

export default function CustomersTab({
  shop,
  customers,
  devices,
  loans,
  onAddCustomer,
  onSelectCustomer,
}: CustomersTabProps) {
  // Navigation states
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeQRCustomerId, setActiveQRCustomerId] = useState<string | null>(null);
  const [activeAgreementLoanId, setActiveAgreementLoanId] = useState<string | null>(null);

  // Form input states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [model, setModel] = useState('');
  const [imei1, setImei1] = useState('');
  const [imei2, setImei2] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [totalAmount, setTotalAmount] = useState('16000');
  const [downPayment, setDownPayment] = useState('4000');
  const [tenureMonths, setTenureMonths] = useState('6');
  
  // Validation and duplicates errors display
  const [errorDisplay, setErrorDisplay] = useState('');

  // Filtering list by current active shop
  const shopCustomers = customers.filter(c => c.shopId === shop.id);

  // Form submit handler with strict duplication checks (matches specifications exactly)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDisplay('');

    // Field sanitizations
    const trimName = name.trim();
    const trimPhone = phone.trim();
    const trimModel = model.trim();
    const cleanImei1 = imei1.replace(/\s+/g, '');
    const cleanImei2 = imei2.replace(/\s+/g, '');
    const cleanSerNo = serialNumber.replace(/\s+/g, '');

    if (!trimName || !trimPhone || !trimModel || !cleanImei1 || !cleanImei2 || !cleanSerNo) {
      setErrorDisplay('Error: Please complete all required profile fields onboarding.');
      return;
    }

    if (cleanImei1.length !== 15 || cleanImei2.length !== 15) {
      setErrorDisplay('IMEI Validation Failure: Standard mobile IMEIs must contain exactly 15 numeric digits.');
      return;
    }

    if (cleanImei1 === cleanImei2) {
      setErrorDisplay('IMEI Validation Failure: Primary IMEI1 and Secondary IMEI2 cannot be identical.');
      return;
    }

    // DUPLICATE PREVENTION LOGIC (Cross-matching check)
    const duplicateImei1Exists = devices.some(d => d.imei1 === cleanImei1 || d.imei2 === cleanImei1);
    const duplicateImei2Exists = devices.some(d => d.imei1 === cleanImei2 || d.imei2 === cleanImei2);

    if (duplicateImei1Exists) {
      setErrorDisplay(`Security Block: IMEI 1 value (${cleanImei1}) already exists in another device log. Dual registers rejected.`);
      return;
    }

    if (duplicateImei2Exists) {
      setErrorDisplay(`Security Block: IMEI 2 value (${cleanImei2}) already exists in another device log. Dual registers rejected.`);
      return;
    }

    const duplicateSerialExists = devices.some(d => d.serialNumber.toLowerCase() === cleanSerNo.toLowerCase());
    if (duplicateSerialExists) {
      setErrorDisplay(`Registration Failure: Device Serial Number (${cleanSerNo}) is already registered.`);
      return;
    }

    // Auto-generate validation artifacts
    const customerId = `cust-${Math.random().toString(36).substr(2, 9)}`;
    const deviceId = `dev-${Math.random().toString(36).substr(2, 9)}`;
    const loanId = `loan-${Math.random().toString(36).substr(2, 9)}`;
    const activationToken = `ACT-ESL-${Math.floor(1000 + Math.random() * 9000)}`;
    const seedSecret = `${shop.id.substring(5).toUpperCase()}-SEC-${Math.floor(1000 + Math.random() * 9000)}`;

    const newCustomer: Customer = {
      id: customerId,
      shopId: shop.id,
      name: trimName,
      phone: trimPhone,
      email: email.trim() || `${trimName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      address: address.trim() || 'Gujarat, India',
      aadhaarPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      panPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
      avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${trimName}`,
      status: 'active'
    };

    const newDevice: Device = {
      id: deviceId,
      customerId: customerId,
      shopId: shop.id,
      model: trimModel,
      imei1: cleanImei1,
      imei2: cleanImei2,
      serialNumber: cleanSerNo.toUpperCase(),
      activationToken: activationToken,
      isActive: true,
      isLocked: false,
      lockLevel: 1,
      offlineUnlockSecret: seedSecret,
      batteryLevel: 100,
      internetConnected: true,
      lastOnline: new Date().toISOString(),
      androidVersion: '14.0 (Latest)',
      liveLatitude: 22.3039 + (Math.random() - 0.5) * 0.1,
      liveLongitude: 70.8022 + (Math.random() - 0.5) * 0.1,
      usbTransferBlocked: true,
      factoryResetBlocked: true,
      cameraBlocked: false,
      kioskModeActive: false
    };

    const totalAmt = parseFloat(totalAmount) || 15000;
    const downPmt = parseFloat(downPayment) || 3000;
    const tenure = parseInt(tenureMonths) || 6;
    const remaining = totalAmt - downPmt;
    const monthlyEmi = Math.round(remaining / tenure);

    const newLoan: Loan = {
      id: loanId,
      deviceId: deviceId,
      customerId: customerId,
      shopId: shop.id,
      totalAmount: totalAmt,
      downPayment: downPmt,
      remainingAmount: remaining,
      tenureMonths: tenure,
      interestRate: 12,
      nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      monthlyEmiAmount: monthlyEmi,
      status: 'active',
      gracePeriodDays: 3
    };

    onAddCustomer(newCustomer, newDevice, newLoan);
    
    // Clear state inputs
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setModel('');
    setImei1('');
    setImei2('');
    setSerialNumber('');
    setTotalAmount('16000');
    setDownPayment('4000');
    setTenureMonths('6');
    setShowAddForm(false);
    
    alert(`🎉 Successfully onboarded customer "${trimName}". Dual QRs are now available to fetch DPC keys.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Shops Customer Registry</h2>
          <p className="text-zinc-500 text-xs">Register, generate setup QRs, and edit loan amortizations active</p>
        </div>
        
        <button
          onClick={() => { setShowAddForm(!showAddForm); setErrorDisplay(''); }}
          className="bg-indigo-650 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
        >
          {showAddForm ? <Ban className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancel Onboarding' : 'Enroll New Customer'}
        </button>
      </div>

      {/* DUPLICATE ENGINE ENROLLMENT FORM */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900/60 border border-slate-850 p-6 rounded-3xl space-y-6 animate-fade-in relative">
          
          <div className="border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              Onboard Hardware & customer Profile
            </h3>
            <p className="text-zinc-500 text-[10px] mt-0.5 uppercase tracking-wide font-mono">Guarantees unique IMEI database registers</p>
          </div>

          {errorDisplay && (
            <div className="bg-rose-950/60 border border-rose-900 text-rose-300 text-[11px] p-3.5 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold">Validation Alert</span>
                <p>{errorDisplay}</p>
              </div>
            </div>
          )}

          {/* Setup grids */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Column 1: Customer Personal Profile */}
            <div className="space-y-4">
              <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-mono font-bold block">1. Customer Biography</span>
              
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono text-zinc-500">FullName *</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-9 text-xs text-white outline-none focus:border-indigo-650"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono text-zinc-500">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="phone"
                    required
                    placeholder="e.g. +91 94282 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-9 text-xs text-white outline-none focus:border-indigo-650"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono text-zinc-500">Address Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="e.g. Nana Mava Chowk, Rajkot"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-9 text-xs text-white outline-none focus:border-indigo-650"
                  />
                </div>
              </div>
            </div>

            {/* Column 2: Device Unique details */}
            <div className="space-y-4">
              <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-mono font-bold block">2. Hardware Registry</span>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono text-zinc-500">Device Model *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samsung M34 5G (128GB)"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-indigo-650"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-zinc-500">IMEI 1 (15 DIGITS) *</label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    placeholder="864521049981245"
                    value={imei1}
                    onChange={(e) => setImei1(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs font-mono text-white outline-none focus:border-indigo-650"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-zinc-500">IMEI 2 (15 DIGITS) *</label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    placeholder="864521049981252"
                    value={imei2}
                    onChange={(e) => setImei2(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs font-mono text-white outline-none focus:border-indigo-650"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono text-zinc-500">Serial Number (S/N) *</label>
                <input
                  type="text"
                  required
                  placeholder="SN9981245OP"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs font-mono text-white outline-none focus:border-indigo-650"
                />
              </div>
            </div>

            {/* Column 3: Interest and EMI Details */}
            <div className="space-y-4">
              <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-mono font-bold block">3. Financing Scheme</span>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-zinc-500">Product Retail Price (INR) *</label>
                  <input
                    type="number"
                    required
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs font-mono text-white outline-none focus:border-indigo-650"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-zinc-500">Down Payment (INR) *</label>
                  <input
                    type="number"
                    required
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs font-mono text-white outline-none focus:border-indigo-650"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono text-zinc-500">Tenure Months (EMI Cycles)</label>
                <select
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-indigo-650"
                >
                  <option value="4">4 Months (Short Cycle)</option>
                  <option value="6">6 Months (Standard Plan)</option>
                  <option value="9">9 Months (Long Amortization)</option>
               </select>
              </div>

              <div className="bg-zinc-950/80 p-3 rounded-2xl border border-zinc-850 text-[10px] space-y-1">
                <span className="text-zinc-500 uppercase font-mono">Predicted Amortization:</span>
                <div className="flex justify-between">
                  <span>Balance Outstanding:</span>
                  <span className="font-bold text-white font-mono">₹{(parseFloat(totalAmount) - parseFloat(downPayment)) || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Monthly EMI:</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    ₹{Math.round(((parseFloat(totalAmount) - parseFloat(downPayment)) || 0) / parseInt(tenureMonths))}
                  </span>
                </div>
              </div>
            </div>

          </div>

          <div className="text-right pt-2 border-t border-zinc-800">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-lg transition-all"
            >
              Secure Register & Get Provisioning Keys
            </button>
          </div>

        </form>
      )}

      {/* Customer Registry Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {shopCustomers.map((cust) => {
          const deviceDef = devices.find(d => d.customerId === cust.id);
          const loanDef = loans.find(l => l.customerId === cust.id);
          
          return (
            <div key={cust.id} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm">
              <div>
                {/* Visual Identity section */}
                <div className="flex items-center gap-3 border-b border-zinc-800/60 pb-3 mb-3">
                  <img 
                    src={cust.avatarUrl} 
                    alt="avatar" 
                    className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 p-0.5"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="font-bold text-white leading-tight">{cust.name}</h3>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{cust.phone}</p>
                  </div>
                </div>

                {/* Info summary */}
                <div className="space-y-2.5 text-xs text-zinc-350">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Device Model:</span>
                    <span className="font-medium text-white truncate max-w-40">{deviceDef?.model || 'Undefined'}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-zinc-500">EMIs Left:</span>
                    <span className="font-mono text-zinc-200">
                      {loanDef ? `${Math.round(loanDef.remainingAmount / loanDef.monthlyEmiAmount)} Months` : 'Completed'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-500">Outstanding:</span>
                    <span className="font-mono font-bold text-white">
                      ₹{loanDef?.remainingAmount.toLocaleString('en-IN') || '0'}
                    </span>
                  </div>

                  {deviceDef && (
                    <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-850 flex justify-between items-center text-[10.5px]">
                      <span className="text-zinc-500 font-mono shrink-0">Activation Token:</span>
                      <span className="text-indigo-400 font-mono font-bold bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-900">
                        {deviceDef.activationToken}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* QR and setup interactions toolbar */}
              <div className="mt-4 pt-3.5 border-t border-zinc-800/70 space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setActiveQRCustomerId(cust.id === activeQRCustomerId ? null : cust.id);
                      setActiveAgreementLoanId(null);
                    }}
                    className={`text-[10px] font-bold py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      activeQRCustomerId === cust.id 
                        ? 'bg-amber-950 border-amber-900 text-amber-400' 
                        : 'bg-zinc-950 border-zinc-850 hover:bg-zinc-900 text-zinc-200'
                    }`}
                  >
                    <Key className="w-3.5 h-3.5" />
                    Setup QRs
                  </button>

                  <button
                    onClick={() => {
                      if (loanDef) {
                        setActiveAgreementLoanId(loanDef.id === activeAgreementLoanId ? null : loanDef.id);
                        setActiveQRCustomerId(null);
                      } else {
                        alert("Loan cleared fully! Agreement closed.");
                      }
                    }}
                    className={`text-[10px] font-bold py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      activeAgreementLoanId === loanDef?.id 
                        ? 'bg-emerald-950 border-emerald-900 text-emerald-400' 
                        : 'bg-zinc-950 border-zinc-850 hover:bg-zinc-900 text-zinc-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Agreement PDF
                  </button>
                </div>

                <button
                  onClick={() => onSelectCustomer(cust)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5"
                >
                  Inspect Sandbox Phone
                  <ChevronRight className="w-3.5 h-3.5 animate-pulse" />
                </button>
              </div>

              {/* DUAL QRs SUBDRAWER DISPLAY */}
              {activeQRCustomerId === cust.id && deviceDef && (() => {
                const qr1Payload = {
                  "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME": "com.emisecure.customer/com.emisecure.customer.MyDeviceAdminReceiver",
                  "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION": "https://emisecure.com/apps/secure-lock.apk",
                  "android.app.extra.PROVISIONING_DEVICE_ADMIN_SIGNATURE_CHECKSUM": "q-S7hTu7Y_2re3_U88_v988w9eWp2n8tX9OpP_y9Z88=",
                  "android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE": {
                    "device_id": deviceDef.id,
                    "activation_token": deviceDef.activationToken,
                    "server_handshake_endpoint": "https://fcm.googleapis.com"
                  }
                };

                const qr2Payload = {
                  "tenant_id": "phoneworld-secured",
                  "shop_id": deviceDef.shopId,
                  "device_id": deviceDef.id,
                  "device_model": deviceDef.model,
                  "serial_number": deviceDef.serialNumber,
                  "activation_token": deviceDef.activationToken,
                  "client_name": cust.name,
                  "onboard_timestamp": new Date().toISOString()
                };

                return (
                  <div className="mt-4 bg-zinc-950 border border-zinc-850 rounded-2xl p-4.5 space-y-4 animate-fade-in text-center font-sans">
                    
                    <div>
                      <h4 className="font-bold text-white text-xs">Provisioning Setup QR Suite</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5 leading-normal">Follow the Device Owner activation workflow without a laptop</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 mt-2">
                      {/* QR 1 Card */}
                      <div className="bg-white p-2.5 rounded-xl border border-zinc-200 text-center text-slate-900 flex flex-col justify-between h-44">
                        <p className="text-[9px] uppercase font-mono font-bold tracking-wider text-zinc-500 mb-1">Step 1: Test DPC</p>
                        <div className="w-24 h-24 bg-zinc-50 mx-auto rounded border border-zinc-200 flex items-center justify-center p-1 relative">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=0f172a&data=${encodeURIComponent(JSON.stringify(qr1Payload))}`}
                            alt="QR 1"
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <span className="text-[8.5px] text-zinc-500 block mt-1 font-mono">Scan on setup screen</span>
                      </div>

                      {/* QR 2 Card */}
                      <div className="bg-white p-2.5 rounded-xl border border-zinc-200 text-center text-slate-900 flex flex-col justify-between h-44">
                        <p className="text-[9px] uppercase font-mono font-bold tracking-wider text-indigo-650 mb-1">Step 2: Secure Lock</p>
                        <div className="w-24 h-24 bg-zinc-50 mx-auto rounded border border-zinc-200 flex items-center justify-center p-1 relative">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=4f46e5&data=${encodeURIComponent(JSON.stringify(qr2Payload))}`}
                            alt="QR 2"
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <span className="text-[8.5px] text-indigo-650 block mt-1 font-mono font-bold">{deviceDef.activationToken}</span>
                      </div>
                    </div>

                    <div className="bg-slate-905 border border-slate-800 text-[10px] text-zinc-400 p-2.5 rounded-xl text-left leading-normal space-y-1 font-sans">
                      <span className="font-bold text-zinc-200">Execution Instructions:</span>
                      <ol className="list-decimal pl-4.5 space-y-0.5 text-[9px]">
                        <li>Factory reset modern Android setup device.</li>
                        <li>Tap welcome setup screen 6 times to open scanner.</li>
                        <li>Scan <span className="font-bold">QR 1</span> (installs secure Test DPC owner bootstrap).</li>
                        <li>Install <span className="font-bold">EMI Secure Lock Client App</span>.</li>
                        <li>Scan <span className="font-bold">QR 2</span> configuration to bind and transfer permissions.</li>
                      </ol>
                    </div>

                  </div>
                );
              })()}

              {/* AGREEMENT RECEIPT PDF SUBDRAWER */}
              {activeAgreementLoanId === loanDef?.id && loanDef && (
                <div className="mt-4 bg-zinc-950 border border-zinc-850 rounded-2xl p-5 animate-fade-in text-left space-y-3.5">
                  <div className="border-b border-zinc-850 pb-2.5 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white text-xs uppercase tracking-wide">EMI Financing Agreement</h4>
                      <p className="text-[9px] text-emerald-400 font-mono mt-0.5">EST. CONTRACT REF: #{loanDef.id.substring(5).toUpperCase()}</p>
                    </div>
                    <FileText className="w-5 h-5 text-indigo-400" />
                  </div>

                  <div className="text-[10px] space-y-1.5 text-zinc-350">
                    <p className="font-sans leading-relaxed">
                      This formal agreement binds <span className="text-white font-bold">{cust.name}</span> ("Buyer") and <span className="text-white font-bold">{shop.name}</span> ("Vendor") under physical collateral escrow parameters.
                    </p>
                    
                    <div className="bg-zinc-900 border border-zinc-850 p-2.5 rounded-xl space-y-1 italic text-[9px] font-mono leading-normal">
                      <p>• Device: {deviceDef?.model}</p>
                      <p>• Hardware Identifier IMEI1: {deviceDef?.imei1}</p>
                      <p>• Principal Loan Bracket: ₹{loanDef.totalAmount.toLocaleString('en-IN')}</p>
                      <p>• Monthly Installment: ₹{loanDef.monthlyEmiAmount} × {loanDef.tenureMonths} Cycles</p>
                      <p>• Next Trigger Date: {loanDef.nextDueDate}</p>
                    </div>

                    <p className="text-[9px] text-zinc-500 font-sans leading-relaxed">
                      *COVENANT: In addition to the primary terms, the buyer permits DPC Device Owner policy suspension, including safe mode isolation, USB data block, policy level reminders on overdue status, and full screen secure locking. Gujarat State jurisidiction applied.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      alert("Simulating Invoice PDF creation and download receipt...");
                    }}
                    className="w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 font-bold text-[10px] py-1.5 rounded-xl text-center cursor-pointer"
                  >
                    Download Printed Contract (PDF)
                  </button>
                </div>
              )}

            </div>
          );
        })}

      </div>

    </div>
  );
}
