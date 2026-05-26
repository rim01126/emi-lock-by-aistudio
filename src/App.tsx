import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shop,
  Customer,
  Device,
  Loan,
  Installment,
  Payment,
  DeviceCommand,
  SimChangeLog,
  IntegrityAlert,
  AuditLog
} from './types';
import {
  defaultShops,
  defaultProfiles,
  defaultCustomers,
  defaultDevices,
  defaultLoans,
  defaultInstallments,
  defaultPayments,
  defaultSimChangeLogs,
  defaultIntegrityAlerts,
  defaultAuditLogs,
} from './initialData';

// Subcomponents import
import OverviewTab from './components/OverviewTab';
import CustomersTab from './components/CustomersTab';
import DevicesTab from './components/DevicesTab';
import PaymentsTab from './components/PaymentsTab';
import LogsTab from './components/LogsTab';
import GuidesTab from './components/GuidesTab';
import SettingsTab from './components/SettingsTab';
import CustomerAppPhone from './components/CustomerAppPhone';

// Icons
import {
  Menu, Pickaxe,
  TrendingUp,
  Users,
  Smartphone,
  IndianRupee,
  ShieldCheck,
  Code,
  Settings,
  X,
  Store,
  ChevronDown,
  MonitorSmartphone,
  UserCheck,
  ShieldAlert
} from 'lucide-react';

export default function App() {
  // Tenancy states
  const [activeShop, setActiveShop] = useState<Shop>(defaultShops[0]);
  const [isTenantOpen, setIsTenantOpen] = useState(false);

  // Core state datasets representing live database rows
  const [profiles, setProfiles] = useState<Profile[]>(defaultProfiles);
  const [customers, setCustomers] = useState<Customer[]>(defaultCustomers);
  const [devices, setDevices] = useState<Device[]>(defaultDevices);
  const [loans, setLoans] = useState<Loan[]>(defaultLoans);
  const [installments, setInstallments] = useState<Installment[]>(defaultInstallments);
  const [payments, setPayments] = useState<Payment[]>(defaultPayments);
  const [simChangeLogs, setSimChangeLogs] = useState<SimChangeLog[]>(defaultSimChangeLogs);
  const [integrityAlerts, setIntegrityAlerts] = useState<IntegrityAlert[]>(defaultIntegrityAlerts);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(defaultAuditLogs);
  const [commands, setCommands] = useState<DeviceCommand[]>([]);

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Floating Device Simulator selections
  const [panelCustomer, setPanelCustomer] = useState<Customer | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(true);

  // Set default client model to inspect on start
  useEffect(() => {
    const shopClients = customers.filter(c => c.shopId === activeShop.id);
    if (shopClients.length > 0) {
      setPanelCustomer(shopClients[0]);
    } else {
      setPanelCustomer(null);
    }
  }, [activeShop]);

  const activeDevice = panelCustomer 
    ? devices.find(d => d.customerId === panelCustomer.id) || null
    : null;
    
  const activeLoan = panelCustomer
    ? loans.find(l => l.customerId === panelCustomer.id) || null
    : null;

  const currentOwner = profiles.find(p => p.shopId === activeShop.id && p.role === 'owner') || { 
    id: 'temp', shopId: activeShop.id, fullName: 'Owner', role: 'owner', email: activeShop.id === 'shop-rajkot' ? 'rim01119@gmail.com' : 'owner.sai@gmail.com', password: '' 
  };

  // Real-time operations handlers

  // 1. ADD NEW CUSTOMER PROFILE (Requires hardware details)
  const handleAddCustomer = (newCust: Customer, newDev: Device, newLoan: Loan) => {
    setCustomers(prev => [...prev, newCust]);
    setDevices(prev => [...prev, newDev]);
    setLoans(prev => [...prev, newLoan]);

    // Create installment schedules
    const schedules: Installment[] = [];
    for (let i = 1; i <= newLoan.tenureMonths; i++) {
      const scheduleDate = new Date();
      scheduleDate.setMonth(scheduleDate.getMonth() + i);
      schedules.push({
        id: `inst-${newLoan.id}-${i}-${Math.random().toString(36).substr(2,4)}`,
        loanId: newLoan.id,
        installmentNo: i,
        dueDate: scheduleDate.toISOString().split('T')[0],
        amount: newLoan.monthlyEmiAmount,
        amountPaid: 0,
        status: 'pending'
      });
    }
    setInstallments(prev => [...prev, ...schedules]);

    // audit entries
    const log: AuditLog = {
      id: `aud-${Date.now()}`,
      shopId: activeShop.id,
      userId: 'user-jayesh', // Simulated logged owner
      userEmail: currentOwner.email,
      action: 'REGISTER_CUSTOMER',
      targetType: 'customer',
      targetId: newCust.id,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  // 2. LOG CASH OR UPI RECEIPTS
  const handleAddPayment = (loanId: string, amt: number, method: 'cash' | 'upi' | 'bank_transfer', uploadSlip?: string) => {
    const freshPayment: Payment = {
      id: `pmt-${Date.now()}`,
      loanId: loanId,
      amount: amt,
      paymentDate: new Date().toISOString(),
      recordedBy: activeShop.id === 'shop-rajkot' ? 'Jayeshbhai Patel' : 'Hardik Shah',
      paymentMethod: method,
      status: 'cleared',
      screenshotUrl: uploadSlip,
      receiptNumber: `REC-${activeShop.logoText.toUpperCase().substr(0,2)}-${Math.floor(10000 + Math.random() * 90000)}`
    };

    setPayments(prev => [freshPayment, ...prev]);

    // Deduct from Loans remaining metrics
    setLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        const revisedRemaining = Math.max(0, l.remainingAmount - amt);
        const resolvedStatus = revisedRemaining <= 0 ? 'paid' : l.status;
        
        // If loan has been settled fully, automatically generate unlock flags to clear overlay locks!
        if (revisedRemaining <= 0) {
          setTimeout(() => {
            alert(`🎉 Principal debt cleared! ESL Server automatically dispatches standard Device UI UNLOCK push commands.`);
            setDevices(prevDev => prevDev.map(d => {
              if (d.customerId === l.customerId) {
                return { ...d, isLocked: false, lockLevel: 1 };
              }
              return d;
            }));
          }, 400);
        }

        return {
          ...l,
          remainingAmount: revisedRemaining,
          status: resolvedStatus
        };
      }
      return l;
    }));

    // Update installments schedules cleared records
    setInstallments(prev => {
      let unallotedAmt = amt;
      return prev.map(inst => {
        if (inst.loanId === loanId && inst.status !== 'paid' && unallotedAmt > 0) {
          const gap = inst.amount - inst.amountPaid;
          if (unallotedAmt >= gap) {
            unallotedAmt -= gap;
            return { ...inst, amountPaid: inst.amount, status: 'paid' as const };
          } else {
            const added = inst.amountPaid + unallotedAmt;
            unallotedAmt = 0;
            return { ...inst, amountPaid: added, status: 'partially_paid' as const };
          }
        }
        return inst;
      });
    });

    // audit log
    const log: AuditLog = {
      id: `aud-${Date.now()}`,
      shopId: activeShop.id,
      userId: 'user-jayesh',
      userEmail: currentOwner.email,
      action: 'ADD_PAYMENT_RECEIPT',
      targetType: 'payment',
      targetId: freshPayment.id,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  // 3. EDIT PREVIOUS TRANSACTION VALUES (Enforces strict logging audit entries)
  const handleEditPayment = (paymentId: string, updatedAmount: number) => {
    let oldAmtVal = 0;
    
    setPayments(prev => prev.map(p => {
      if (p.id === paymentId) {
        oldAmtVal = p.amount;
        return { ...p, amount: updatedAmount };
      }
      return p;
    }));

    // permanent audit log
    const log: AuditLog = {
      id: `aud-${Date.now()}`,
      shopId: activeShop.id,
      userId: 'user-jayesh',
      userEmail: currentOwner.email,
      action: 'EDIT_PAYMENT_AUDIT',
      targetType: 'payment',
      targetId: paymentId,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  // 4. TRIGGER REMOTE DEVICE POLICIES (LOCK/WALLPAPERS/RESTRICTIONS)
  const handleTriggerCommand = (deviceId: string, commandType: DeviceCommand['commandType'], payload?: any) => {
    const cmdId = `cmd-${Math.random().toString(36).substr(2, 9)}`;
    const newCmd: DeviceCommand = {
      id: cmdId,
      deviceId: deviceId,
      commandType: commandType,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCommands(prev => [...prev, newCmd]);

    // Simulate instant FCM network hops delivery
    setTimeout(() => {
      setCommands(prev => prev.map(c => c.id === cmdId ? { ...c, status: 'executed' } : c));
      
      // Update Device specific configurations based on push type
      setDevices(prev => prev.map(d => {
        if (d.id === deviceId) {
          let updated = { ...d };
          switch (commandType) {
            case 'LOCK_DEVICE':
              updated.isLocked = true;
              updated.lockLevel = 4;
              break;
            case 'UNLOCK_DEVICE':
              updated.isLocked = false;
              updated.lockLevel = 1;
              break;
            case 'BLOCK_SOCIAL_APPS':
              updated.isLocked = true;
              updated.lockLevel = 2; // Level 2: App suspensions
              break;
            case 'UNBLOCK_SOCIAL_APPS':
              if (updated.lockLevel === 2) {
                updated.isLocked = false;
              }
              break;
            case 'LOCK_USB_TRANSFER':
              updated.usbTransferBlocked = true;
              break;
            case 'UNLOCK_USB_TRANSFER':
              updated.usbTransferBlocked = false;
              break;
            case 'DISABLE_FACTORY_RESET':
              updated.factoryResetBlocked = true;
              break;
            case 'ENABLE_FACTORY_RESET':
              updated.factoryResetBlocked = false;
              break;
            case 'DISABLE_CAMERA':
              updated.cameraBlocked = true;
              break;
            case 'ENABLE_CAMERA':
              updated.cameraBlocked = false;
              break;
            case 'ENABLE_KIOSK_MODE':
              updated.kioskModeActive = true;
              break;
            case 'DISABLE_KIOSK_MODE':
              updated.kioskModeActive = false;
              break;
          }
          updated.lastOnline = new Date().toISOString();
          return updated;
        }
        return d;
      }));
    }, 1500);

    // Write audit activity
    const log: AuditLog = {
      id: `aud-${Date.now()}`,
      shopId: activeShop.id,
      userId: 'user-jayesh',
      userEmail: currentOwner.email,
      action: `DEVICE_COMMAND_${commandType}`,
      targetType: 'device',
      targetId: deviceId,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  // 5. BEZEL SIMULATOR DIRECT CALLBACK TRIGGERS
  const handleSimulateLockState = (locked: boolean, level: 1 | 2 | 3 | 4) => {
    if (!activeDevice) return;
    setDevices(prev => prev.map(d => {
      if (d.id === activeDevice.id) {
        return { ...d, isLocked: locked, lockLevel: level, lastOnline: new Date().toISOString() };
      }
      return d;
    }));
  };

  const handleSimulateIntegrityAlert = (type: IntegrityAlert['type'], desc: string) => {
    if (!activeDevice) return;
    const newAlert: IntegrityAlert = {
      id: `int-${Date.now()}`,
      deviceId: activeDevice.id,
      type: type,
      description: desc,
      detectedAt: new Date().toISOString(),
      autoLocked: type === 'root' || type === 'usb_debugging' // Policy auto triggers overlays
    };
    setIntegrityAlerts(prev => [newAlert, ...prev]);

    // If critical alert triggers lock
    if (type === 'root' || type === 'usb_debugging') {
      setDevices(prev => prev.map(d => {
        if (d.id === activeDevice.id) {
          return { ...d, isLocked: true, lockLevel: 4, lastOnline: new Date().toISOString() };
        }
        return d;
      }));
    }
  };

  const handleSimulateSimChange = (oldNum: string, newNum: string) => {
    if (!activeDevice) return;
    const log: SimChangeLog = {
      id: `sim-${Date.now()}`,
      deviceId: activeDevice.id,
      oldIccid: `ICCID-${Math.floor(100000000 + Math.random() * 900000000)}`,
      newIccid: `ICCID-${Math.floor(100000000 + Math.random() * 900000000)}`,
      oldNumber: oldNum || '+91 94282 30190',
      newNumber: newNum,
      alertedAt: new Date().toISOString()
    };
    setSimChangeLogs(prev => [log, ...prev]);
    alert(`🚨 SIM swap interception log created! System owners received a notification about ${newNum}.`);
  };

  const handleDeviceUpdate = (attrs: Partial<Device>) => {
    if (!activeDevice) return;
    setDevices(prev => prev.map(d => {
      if (d.id === activeDevice.id) {
        return { ...d, ...attrs, lastOnline: new Date().toISOString() };
      }
      return d;
    }));
  };

  const handleClearCommandLogs = (deviceId: string) => {
    setCommands(prev => prev.filter(c => c.deviceId !== deviceId));
  };


  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex overflow-hidden font-sans">
      
      {/* 1. MASTER COLLAPSIBLE NAVIGATION SIDEBAR */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 hidden md:flex relative z-30">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-650 flex items-center justify-center text-white font-bold text-xs ring-4 ring-indigo-500/10 shadow-lg">
              🛡️
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-white leading-none">EMI Secure Lock</h1>
              <span className="text-[10px] text-zinc-500 font-mono tracking-wider font-bold">DPC Admin Consule</span>
            </div>
          </div>

          {/* Tenants selector */}
          <div className="p-4 border-b border-slate-800 relative">
            <button
              onClick={() => setIsTenantOpen(!isTenantOpen)}
              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700/80 rounded-xl p-3 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2 text-left">
                <Store className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-xs font-bold text-zinc-200 truncate max-w-32">{activeShop.name}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${isTenantOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Select options overlay lists */}
            <AnimatePresence>
              {isTenantOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute left-4 right-4 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden font-sans"
                >
                  {defaultShops.map((shopItem) => (
                    <button
                      key={shopItem.id}
                      onClick={() => {
                        setActiveShop(shopItem);
                        setIsTenantOpen(false);
                      }}
                      className={`w-full p-3 text-left text-xs hover:bg-zinc-850 flex items-center justify-between transition-colors ${
                        activeShop.id === shopItem.id ? 'text-indigo-400 font-bold bg-zinc-850/40' : 'text-zinc-400'
                      }`}
                    >
                      <span>{shopItem.name}</span>
                      <span className="text-[9px] uppercase font-bold tracking-wide text-zinc-600 bg-zinc-950 px-1.5 py-0.2 rounded">
                        Shop Tenant
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Nav groups links */}
          <nav className="p-4 space-y-1.5 text-xs">
            
            {[
              { id: 'overview', label: 'Monitor Dashboard', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'customers', label: 'Customer Registry', icon: <Users className="w-4 h-4" /> },
              { id: 'devices', label: 'Push Commands Console', icon: <Smartphone className="w-4 h-4" /> },
              { id: 'payments', label: 'Finance Receipts & Promises', icon: <IndianRupee className="w-4 h-4" /> },
              { id: 'logs', label: 'Security Alarms Logs', icon: <ShieldCheck className="w-4 h-4" /> },
              { id: 'settings', label: 'Tenancy Settings', icon: <Settings className="w-4 h-4" /> },
              { id: 'guides', label: 'DPC APK Build Guides', icon: <Code className="w-4 h-4" /> }
            ].map((route) => {
              const isActive = activeTab === route.id;

              return (
                <button
                  key={route.id}
                  onClick={() => setActiveTab(route.id)}
                  className={`w-full py-2.5 px-3 rounded-xl flex items-center gap-3 font-semibold transition-all text-left cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-600/10 shadow-sm' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-slate-800/40'
                  }`}
                >
                  {route.icon}
                  {route.label}
                </button>
              );
            })}

          </nav>
        </div>

        {/* Footer info clock */}
        <div className="p-4 border-t border-slate-800 text-[10px] text-zinc-500 font-mono tracking-tight leading-normal uppercase">
          <span>Server Status: <span className="text-emerald-400 font-bold animate-pulse">● Live</span></span>
          <p className="mt-1">Tenant GST: {activeShop.gstNumber}</p>
          <p>UTC Clock: 2026-05-26T07:30</p>
        </div>

      </aside>

      {/* 2. MAIN CENTER CONTEXT WORKSPACE FRAME */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-y-auto">
        
        {/* Top Header navbar */}
        <header className="px-6 py-4 bg-white/95 border-b border-slate-200 sticky top-0 backdrop-blur z-20 flex items-center justify-between select-none shadow-sm h-16">
          
          <div className="flex items-center gap-2">
            {/* Mobile menu trigger */}
            <Menu className="w-4 h-4 text-slate-500 md:hidden" />
            <span className="text-[11px] bg-slate-100 border border-slate-200 rounded font-mono px-2 py-0.5 text-slate-600 uppercase font-bold tracking-wider">
              {activeTab} workspace
            </span>
          </div>

          <div className="flex items-center gap-3">
            
            {/* Toggle mobile-view simulator */}
            <button
              onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
              className={`p-2 rounded-xl border flex items-center gap-1.5 font-bold transition-all text-xs cursor-pointer ${
                isSimulatorOpen 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100/85' 
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MonitorSmartphone className="w-4 h-4" />
              <span>{isSimulatorOpen ? 'Hide phone' : 'Inspect Phone'}</span>
            </button>

            {/* Quick user avatar */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <img 
                src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Jayesh" 
                alt="owner" 
                className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200" 
                referrerPolicy="no-referrer"
              />
              <div className="hidden sm:block text-left text-[11.5px] leading-tight">
                <p className="font-bold text-slate-800">Owner Tenant</p>
                <p className="text-[9.5px] text-slate-500">{currentOwner.email}</p>
              </div>
            </div>

          </div>

        </header>

        {/* Workspace views transitions content container layout */}
        <div className="p-6">
          
          {activeTab === 'overview' && (
            <OverviewTab
              shop={activeShop}
              customers={customers}
              devices={devices}
              loans={loans}
              payments={payments}
              installments={installments}
              integrityAlerts={integrityAlerts}
              onSelectCustomer={(cust) => {
                setPanelCustomer(cust);
                setIsSimulatorOpen(true);
              }}
              onNavigateToTab={(tab) => {
                setActiveTab(tab);
              }}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersTab
              shop={activeShop}
              customers={customers}
              devices={devices}
              loans={loans}
              onAddCustomer={handleAddCustomer}
              onSelectCustomer={(cust) => {
                setPanelCustomer(cust);
                setIsSimulatorOpen(true);
              }}
            />
          )}

          {activeTab === 'devices' && (
            <DevicesTab
              shop={activeShop}
              devices={devices}
              customers={customers}
              commands={commands}
              onTriggerCommand={handleTriggerCommand}
              onSelectCustomer={(cust) => {
                setPanelCustomer(cust);
                setIsSimulatorOpen(true);
              }}
              onClearCommandLogs={handleClearCommandLogs}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsTab
              shop={activeShop}
              loans={loans}
              customers={customers}
              payments={payments}
              installments={installments}
              onAddPayment={handleAddPayment}
              onEditPayment={handleEditPayment}
            />
          )}

          {activeTab === 'logs' && (
            <LogsTab
              shop={activeShop}
              customers={customers}
              devices={devices}
              simChangeLogs={simChangeLogs}
              integrityAlerts={integrityAlerts}
              auditLogs={auditLogs}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              shop={activeShop}
              profiles={profiles}
              onUpdateShop={(up) => {
                setActiveShop(up);
                // Also update defaults array so changes toggle themes everywhere!
                const targetIdx = defaultShops.findIndex(s => s.id === up.id);
                if (targetIdx !== -1) {
                  defaultShops[targetIdx] = up;
                }
              }}
              onAddStaff={(newProf) => {
                setProfiles(prev => [...prev, newProf]);
              }}
              onUpdateProfile={(updatedProf) => {
                setProfiles(prev => prev.map(p => p.id === updatedProf.id ? updatedProf : p));
              }}
            />
          )}

          {activeTab === 'guides' && (
            <GuidesTab />
          )}

        </div>

      </main>

      {/* 3. FLOATING COLLAPSIBLE ANDROID DPC SECURE OVERLAYS PHONE SIMULATOR PANEL */}
      <AnimatePresence>
        {isSimulatorOpen && (
          <motion.aside
            initial={{ opacity: 0, x: 250 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 250 }}
            className="w-[380px] bg-white border-l border-slate-200 p-5 shrink-0 hidden xl:flex flex-col justify-start overflow-y-auto relative z-25 text-sans shadow-lg shadow-slate-200/50"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5 mb-4">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-slate-800 text-xs">Sandbox Device Simulator</span>
              </div>
              <button 
                onClick={() => setIsSimulatorOpen(false)}
                className="p-1 rounded bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {panelCustomer && activeDevice ? (
              <div className="space-y-4">
                
                {/* Active inspected customer metadata */}
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 flex items-center gap-3">
                  <img 
                    src={panelCustomer.avatarUrl} 
                    alt="inspected" 
                    className="w-11 h-11 bg-white border border-slate-200 p-0.5 rounded-xl shrink-0" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left leading-tight min-w-0">
                    <span className="text-[9.5px] text-slate-500 uppercase font-mono font-bold block">Inspecting Client:</span>
                    <h4 className="font-extrabold text-slate-800 text-[13px] truncate">{panelCustomer.name}</h4>
                    <p className="text-[10.5px] text-indigo-600 font-semibold mt-1 truncate">{activeDevice.model}</p>
                  </div>
                </div>

                {/* Simulated Phone Bezel UI */}
                <CustomerAppPhone
                  device={activeDevice}
                  loan={activeLoan}
                  onSimulateLockState={handleSimulateLockState}
                  onSimulateIntegrityAlert={handleSimulateIntegrityAlert}
                  onSimulateSimChange={handleSimulateSimChange}
                  onDeviceUpdate={handleDeviceUpdate}
                />

              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-6 relative select-none font-sans">
                <Smartphone className="w-14 h-14 text-slate-300 animate-pulse mb-3" />
                <h4 className="font-bold text-slate-700 text-sm">Sandbox Device Idle</h4>
                <p className="text-slate-500 text-xs px-2 mt-1 max-w-[240px] leading-relaxed">
                  Onboard clients or click "Inspect Sandbox Phone" on the Customers page to start modeling dynamic lockout profiles.
                </p>
              </div>
            )}

          </motion.aside>
        )}
      </AnimatePresence>

    </div>
  );
}
