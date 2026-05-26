import React, { useState } from 'react';
import { Shop, Customer, Device, SimChangeLog, IntegrityAlert, AuditLog } from '../types';
import { Shield, ShieldAlert, Cpu, Radio, ShieldCheck, Heart, AlertOctagon, RefreshCw, Smartphone } from 'lucide-react';

interface LogsTabProps {
  shop: Shop;
  customers: Customer[];
  devices: Device[];
  simChangeLogs: SimChangeLog[];
  integrityAlerts: IntegrityAlert[];
  auditLogs: AuditLog[];
}

export default function LogsTab({
  shop,
  customers,
  devices,
  simChangeLogs,
  integrityAlerts,
  auditLogs,
}: LogsTabProps) {
  
  // Navigation states
  const [activeSubTab, setActiveSubTab] = useState<'integrity' | 'sim' | 'audit' | 'health'>('integrity');

  // Filter current active shop metrics
  const shopDevices = devices.filter(d => d.shopId === shop.id);
  
  const shopSimLogs = simChangeLogs.filter(log => {
    const dev = devices.find(d => d.id === log.deviceId);
    return dev && dev.shopId === shop.id;
  });

  const shopIntegrityAlerts = integrityAlerts.filter(alert => {
    const dev = devices.find(d => d.id === alert.deviceId);
    return dev && dev.shopId === shop.id;
  });

  const shopAuditLogs = auditLogs.filter(log => log.shopId === shop.id);

  return (
    <div className="space-y-6">
      
      {/* Tab bar header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Central Security Ledger & Logs</h2>
          <p className="text-zinc-500 text-xs">Acknowledge DPC integrity reports, Sim-swap audits, and database write history</p>
        </div>

        <div className="flex bg-zinc-950 p-1 rounded-2xl border border-zinc-858 gap-1.5 font-mono text-[10px]">
          <button
            onClick={() => setActiveSubTab('integrity')}
            className={`py-1.5 px-3 rounded-lg font-bold transition-all ${
              activeSubTab === 'integrity' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Integrity Alerts ({shopIntegrityAlerts.length})
          </button>
          <button
            onClick={() => setActiveSubTab('sim')}
            className={`py-1.5 px-3 rounded-lg font-bold transition-all ${
              activeSubTab === 'sim' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            SIM Changes ({shopSimLogs.length})
          </button>
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`py-1.5 px-3 rounded-lg font-bold transition-all ${
              activeSubTab === 'audit' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Staff Audits ({shopAuditLogs.length})
          </button>
          <button
            onClick={() => setActiveSubTab('health')}
            className={`py-1.5 px-3 rounded-lg font-bold transition-all ${
              activeSubTab === 'health' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Device Health ({shopDevices.length})
          </button>
        </div>
      </div>

      {/* Renders Tab Panels */}

      {/* 1. INTEGRITY ALERTS (Root detection, ADB, magisk, bootloader, mock locations) */}
      {activeSubTab === 'integrity' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 animate-fade-in font-sans">
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-wide">DPC Integrity Alarms Queue</h3>
            <p className="text-zinc-550 text-[10px] mt-0.5">Real-time alerts triggered by Android WorkManager and Play Integrity API</p>
          </div>

          <div className="space-y-4">
            {shopIntegrityAlerts.map((item) => {
              const deviceDef = devices.find(d => d.id === item.deviceId);
              const custDef = deviceDef ? customers.find(c => c.id === deviceDef.customerId) : null;

              return (
                <div key={item.id} className="bg-zinc-950 p-4.5 rounded-2xl border border-zinc-858 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-900 flex items-center justify-center text-amber-500 shrink-0">
                      <AlertOctagon className="w-4.5 h-4.5 animate-pulse" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] bg-amber-950/40 text-amber-500 font-bold border border-amber-900/60 font-mono px-1.5 rounded uppercase uppercase">
                          {item.type} Check
                        </span>
                        <span className="text-zinc-500 text-[10.5px] font-mono">{new Date(item.detectedAt).toLocaleString()}</span>
                      </div>

                      <h4 className="font-bold text-white text-[12.5px] leading-tight">
                        Flag: {item.description}
                      </h4>
                      
                      <p className="text-[10px] text-zinc-400">
                        Device model: <span className="text-white font-medium">{deviceDef?.model}</span> (IMEI: <span className="font-mono text-white">{deviceDef?.imei1}</span>) • customer: <span className="text-indigo-400 font-semibold">{custDef?.name}</span>
                      </p>
                    </div>
                  </div>

                  <span className={`text-[9.5px] px-2.5 py-1 rounded-xl font-bold uppercase shrink-0 text-center inline-block ${
                    item.autoLocked 
                      ? 'bg-rose-950/70 border border-rose-900 text-rose-400' 
                      : 'bg-zinc-900 border border-zinc-850 text-zinc-450'
                  }`}>
                    {item.autoLocked ? '🛡️ Policy Auto-Locked' : 'Audited Alert'}
                  </span>
                </div>
              );
            })}

            {shopIntegrityAlerts.length === 0 && (
              <div className="text-center p-12 bg-zinc-950/40 border border-zinc-850 border-dashed rounded-3xl">
                <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2 animate-bounce" />
                <h4 className="font-bold text-white text-xs">Device Integrity is Pristine</h4>
                <p className="text-zinc-550 text-[10px] mt-0.5">All mobile phone device owners reporting zero tampering flags</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. SIM CHANGES INTENTS */}
      {activeSubTab === 'sim' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 animate-fade-in font-sans">
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-wide">SIM Exchange Intelligence reports</h3>
            <p className="text-zinc-550 text-[10px] mt-0.5">Intercepts and stores ICCID SIM changes to prevent unauthorized handovers</p>
          </div>

          <div className="space-y-4">
            {shopSimLogs.map((item) => {
              const deviceDef = devices.find(d => d.id === item.deviceId);
              const custDef = deviceDef ? customers.find(c => c.id === deviceDef.customerId) : null;

              return (
                <div key={item.id} className="bg-zinc-950 p-4.5 rounded-2xl border border-zinc-858 space-y-3">
                  <div className="flex justify-between flex-wrap items-center gap-2 border-b border-zinc-90 w-full pb-2">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-rose-500 shrink-0" />
                      <span className="font-semibold text-white text-xs">Hardware Swap TriggerED</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">{new Date(item.alertedAt).toLocaleString()}</span>
                  </div>

                  <p className="text-xs text-zinc-350">
                    customer <span className="text-indigo-400 font-bold font-sans">{custDef?.name}</span> swapped their SIM registers on their managed device <span className="text-white font-medium">{deviceDef?.model}</span>:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[10px] leading-normal bg-zinc-900/50 p-3 rounded-xl border border-zinc-850/60">
                    <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-zinc-850 pb-2.5 sm:pb-0">
                      <span className="text-[9px] uppercase tracking-wide text-zinc-500 block">OLD SIM ICCID LOG:</span>
                      <p className="text-zinc-400 truncate w-full">{item.oldIccid}</p>
                      <p className="text-zinc-450">Phone: {item.oldNumber}</p>
                    </div>

                    <div className="space-y-1.5 pl-0 sm:pl-3">
                      <span className="text-[9px] uppercase tracking-wide text-[10px] text-rose-450 block font-bold">Newly Swapped SIM ICCID:</span>
                      <p className="text-white truncate w-full">{item.newIccid}</p>
                      <p className="text-emerald-400 font-bold">Phone: {item.newNumber}</p>
                    </div>
                  </div>

                  <p className="text-[9.5px] italic text-zinc-500 text-left">
                    *FCM alert dispatched back to administrators dashboard. Sim cards are monitored, eSIM parameters locked.
                  </p>
                </div>
              );
            })}

            {shopSimLogs.length === 0 && (
              <div className="text-center p-12 bg-zinc-950/40 border border-zinc-850 border-dashed rounded-3xl">
                <Radio className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
                <h4 className="font-bold text-white text-xs">Sim Cards Synchronized</h4>
                <p className="text-zinc-550 text-[10px] mt-0.5">Identical SIM ICCID parameters matching verified registration values</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. STAFF ACTION AUDITS */}
      {activeSubTab === 'audit' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 animate-fade-in space-y-4 font-mono text-xs">
          <div>
            <h3 className="font-bold text-white text-xs font-sans uppercase tracking-wide">Permanent operations Audits Ledger</h3>
            <p className="text-zinc-550 text-[10px] font-sans mt-0.5">Supabase database transaction records. Writes cannot be deleted.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono">
              <thead className="bg-zinc-950 text-zinc-500 uppercase tracking-widest text-[9px] border-b border-zinc-805">
                <tr>
                  <th className="p-3">Timestamp (UTC)</th>
                  <th className="p-3">Staff Email</th>
                  <th className="p-3">Action code</th>
                  <th className="p-3">Record ID Type</th>
                  <th className="p-3 text-right">Target Ref ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 leading-normal">
                {shopAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-90 pt-0.5 text-[10px]">
                    <td className="p-3 text-zinc-400">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-3 text-zinc-150 font-sans font-semibold">{log.userEmail}</td>
                    <td className="p-3 font-bold text-indigo-400 font-mono text-[10.5px] uppercase tracking-wide">{log.action}</td>
                    <td className="p-3 text-zinc-500 uppercase">{log.targetType}</td>
                    <td className="p-3 text-right text-zinc-450">{log.targetId.substring(0,8).toUpperCase()}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. HEALTH METRICS CHECKLISTS (BATTERY, ANDROID, LAST SYNC) */}
      {activeSubTab === 'health' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 animate-fade-in space-y-4 font-sans">
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-wide">Device Hardware Health Indicators</h3>
            <p className="text-zinc-550 text-[10px] mt-0.5">Battery thresholds, operating environments, and diagnostics sync queues</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {shopDevices.map((dev) => {
              const custDef = customers.find(c => c.id === dev.customerId);

              return (
                <div key={dev.id} className="bg-zinc-950 p-4 rounded-2xl border border-zinc-858 space-y-3">
                  <div className="flex justify-between items-center border-b border-zinc-90 pb-2">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-white leading-tight font-sans text-xs">{dev.model}</h4>
                      <p className="text-[10px] text-zinc-500 font-sans">For: <span className="text-zinc-300 font-semibold">{custDef?.name}</span></p>
                    </div>
                    <span className="text-[9.5px] text-zinc-450 font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-850">
                      V_A{dev.androidVersion.slice(0,4)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10.5px] leading-normal text-zinc-400">
                    <div className="space-y-1">
                      <span>• Battery Charge: <span className="font-bold text-white">{dev.batteryLevel}%</span></span>
                      <div className="w-full bg-zinc-950 h-1.5 rounded-full mt-0.5 overflow-hidden border border-zinc-900">
                        <div 
                          className={`h-full rounded-full ${dev.batteryLevel < 20 ? 'bg-rose-500' : 'bg-emerald-450'}`}
                          style={{ width: `${dev.batteryLevel}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span>• Sync Period: <span className="font-bold text-zinc-200">Every 4 Hrs</span></span>
                      <p className="text-[9.5px] text-zinc-500 truncate">Last: {new Date(dev.lastOnline).toLocaleTimeString()}</p>
                    </div>
                  </div>

                  <div className="bg-zinc-900/40 p-2 text-zinc-500 text-[9.5px] rounded border border-zinc-850/50 flex justify-between">
                    <span>anti-uninstall: <span className="text-emerald-400 font-bold">LOCKED</span></span>
                    <span>debug features: <span className="text-rose-450 font-bold">BLOCKED</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
