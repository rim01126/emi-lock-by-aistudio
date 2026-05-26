import React, { useState } from 'react';
import { Customer, Device, DeviceCommand, Shop } from '../types';
import { Smartphone, Shield, Wifi, WifiOff, Battery, Play, Key, Settings2, Trash, AlertTriangle, ShieldCheck } from 'lucide-react';

interface DevicesTabProps {
  shop: Shop;
  devices: Device[];
  customers: Customer[];
  commands: DeviceCommand[];
  onTriggerCommand: (deviceId: string, commandType: DeviceCommand['commandType'], payload?: any) => void;
  onSelectCustomer: (cust: Customer) => void;
  onClearCommandLogs: (deviceId: string) => void;
}

export default function DevicesTab({
  shop,
  devices,
  customers,
  commands,
  onTriggerCommand,
  onSelectCustomer,
  onClearCommandLogs,
}: DevicesTabProps) {
  
  // States
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [activeWallpaperUrl, setActiveWallpaperUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300');

  // Filter current active shop's devices
  const shopDevices = devices.filter(d => d.shopId === shop.id);

  // Command categories
  const COMMAND_PRESETS: { type: DeviceCommand['commandType']; label: string; desc: string; category: 'lock' | 'restriction' | 'utility' }[] = [
    { type: 'LOCK_DEVICE', label: 'Enforce Lock (Level 4)', desc: 'Full device secure screen overlay lock. Blocks launcher.', category: 'lock' },
    { type: 'UNLOCK_DEVICE', label: 'Bypass Lock (Permit)', desc: 'Clear secure overlay block. Back to home screen.', category: 'lock' },
    { type: 'BLOCK_SOCIAL_APPS', label: 'Suspend Social (L2)', desc: 'Disables Instagram, Facebook, WhatsApp under DPC policy.', category: 'lock' },
    { type: 'UNBLOCK_SOCIAL_APPS', label: 'Permit Social', desc: 'Restore standard package launch permissions instantly.', category: 'lock' },
    
    { type: 'LOCK_USB_TRANSFER', label: 'Block USB Debug/ADB', desc: 'Disables USB storage, MTP, and debugging features.', category: 'restriction' },
    { type: 'UNLOCK_USB_TRANSFER', label: 'Allow USB Debug', desc: 'Permit standard file transferring and shell ADB.', category: 'restriction' },
    { type: 'DISABLE_FACTORY_RESET', label: 'Disallow Factory Reset', desc: 'Blocks Settings menu factory wipe command completely.', category: 'restriction' },
    { type: 'ENABLE_FACTORY_RESET', label: 'Permit Factory Reset', desc: 'Allow device format (intended for retail maintenance).', category: 'restriction' },
    { type: 'DISABLE_CAMERA', label: 'Lock Device Camera', desc: 'Block sensor access. Camera app loads blank.', category: 'restriction' },
    { type: 'ENABLE_CAMERA', label: 'Permit Device Camera', desc: 'Allow standard image captures and video feeds.', category: 'restriction' },
    
    { type: 'EMI_SCREEN_REMINDER', label: 'Push Screen Notification', desc: 'Brings warning popups immediately into active screens.', category: 'utility' },
    { type: 'EMI_AUDIO_REMINDER', label: 'Broadcast Voice Alert', desc: 'Triggers Gujarati audio synthesized broadcast loops.', category: 'utility' },
    { type: 'SET_WALLPAPER', label: 'Set Collateral Logo', desc: 'Set default secure locking reminder lockscreen wallpaper.', category: 'utility' },
    { type: 'REMOVE_WALLPAPER', label: 'Restore Wallpaper', desc: 'Restore default user-customized image settings.', category: 'utility' },
    { type: 'ENABLE_KIOSK_MODE', label: 'Activate Single-App Kiosk', desc: 'Pin store application into focused display context.', category: 'utility' },
    { type: 'DISABLE_KIOSK_MODE', label: 'Kill Active Kiosk', desc: 'Release pinned app and allow normal home launcher.', category: 'utility' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div>
        <h2 className="text-lg font-bold text-white">Active Device Command Console</h2>
        <p className="text-zinc-500 text-xs">Verify hardware synchronization logs and trigger remote admin execution policies</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Device selection fleet list */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 lg:col-span-1 space-y-4">
          <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-mono font-bold block mb-1">Target Device Selection</span>

          <div className="space-y-3">
            {shopDevices.map((dev) => {
              const custDef = customers.find(c => c.id === dev.customerId);
              const isSelected = selectedDeviceId === dev.id;

              return (
                <div
                  key={dev.id}
                  onClick={() => setSelectedDeviceId(isSelected ? null : dev.id)}
                  className={`border rounded-2xl p-4 cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-zinc-950 border-indigo-600 shadow-md ring-1 ring-indigo-600' 
                      : 'bg-zinc-950/80 border-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2.5">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-white text-[12.5px] leading-snug">{dev.model}</h4>
                      <p className="text-zinc-500 text-[10px] font-sans">Owner: <span className="text-zinc-350">{custDef?.name || 'Unbound Customer'}</span></p>
                    </div>
                    
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide shrink-0 ${
                      dev.isLocked 
                        ? 'bg-rose-950/90 border border-rose-905 text-rose-400' 
                        : 'bg-emerald-950/90 border border-emerald-905 text-emerald-400'
                    }`}>
                      {dev.isLocked ? `LOCKED L${dev.lockLevel}` : 'ACTIVE OK'}
                    </span>
                  </div>

                  <div className="mt-3.5 flex justify-between items-center text-[10px] text-zinc-500 border-t border-zinc-900/80 pt-2.5">
                    <div className="flex items-center gap-1.5">
                      <Battery className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{dev.batteryLevel}% Pow</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {dev.internetConnected ? (
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                      ) : (
                        <span className="w-1.5 h-1.5 bg-rose-550 rounded-full" />
                      )}
                      <span className={dev.internetConnected ? "text-emerald-400 font-bold" : "text-rose-500 font-bold"}>
                        {dev.internetConnected ? 'Live' : 'Offline'}
                      </span>
                    </div>

                    <span className="font-mono text-[9px] truncate max-w-24">#{dev.imei1.substring(0,8)}</span>
                  </div>

                </div>
              );
            })}

            {shopDevices.length === 0 && (
              <p className="p-8 text-center text-zinc-550 italic font-medium font-sans">
                No active devices onboarded in this shop yet.
              </p>
            )}
          </div>
        </div>

        {/* Right Columns: Command trigger console and active logs queue */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDeviceId ? (
            (() => {
              const activeDev = devices.find(d => d.id === selectedDeviceId);
              const activeCust = customers.find(c => c.id === activeDev?.customerId);
              const deviceCmds = commands.filter(c => c.deviceId === selectedDeviceId).reverse();
              
              if (!activeDev || !activeCust) return null;

              return (
                <div className="space-y-6">
                  
                  {/* Active Selection Details Headers */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-8 h-8 text-indigo-400" />
                      <div>
                        <h3 className="font-bold text-white text-sm">{activeDev.model}</h3>
                        <p className="text-[11px] text-zinc-500 font-mono">
                          IMEI1: <span className="text-zinc-300">{activeDev.imei1}</span> • IMEI2: <span className="text-zinc-300">{activeDev.imei2}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectCustomer(activeCust)}
                      className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer"
                    >
                      Open Phone Simulator
                    </button>
                  </div>

                  {/* Commands Grid Categorized */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-5">
                    
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                      <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                        <Settings2 className="w-4 h-4 text-indigo-450" />
                        Interactive Push Command Panel
                      </h3>
                      <span className="text-[10px] font-mono text-indigo-450 font-bold bg-indigo-950/60 border border-indigo-900 px-2.5 py-0.5 rounded-full">
                        Secure JWT Edge Functions Router
                      </span>
                    </div>

                    {/* LOCK CODES CATEGORY */}
                    <div className="space-y-3">
                      <span className="text-[9.5px] text-indigo-400 uppercase tracking-widest font-mono font-bold block">1. Escrow Lock Policies (Overdue)</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {COMMAND_PRESETS.filter(p => p.category === 'lock').map(cmd => (
                          <button
                            key={cmd.type}
                            onClick={() => onTriggerCommand(activeDev.id, cmd.type, cmd.type === 'SET_WALLPAPER' ? { url: activeWallpaperUrl } : undefined)}
                            className="bg-zinc-950 border border-zinc-900 hover:border-zinc-750 p-3 rounded-2xl flex items-start gap-3 text-left hover:shadow-md hover:bg-zinc-900/20 group relative overflow-hidden transition-all duration-200 cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-850 flex items-center justify-center shrink-0 text-zinc-400 group-hover:text-amber-400">
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="font-bold text-white text-[11.5px]">{cmd.label}</p>
                              <p className="text-[10.5px] text-zinc-500 leading-normal">{cmd.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* HARDWARE RESTRICTIONS */}
                    <div className="space-y-3 pt-2">
                      <span className="text-[9.5px] text-zinc-550 uppercase tracking-widest font-mono font-bold block">2. Android DPC Hardware Locks</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {COMMAND_PRESETS.filter(p => p.category === 'restriction').map(cmd => (
                          <button
                            key={cmd.type}
                            onClick={() => onTriggerCommand(activeDev.id, cmd.type)}
                            className="bg-zinc-950 border border-zinc-900 hover:border-zinc-750 p-3 rounded-2xl flex items-start gap-3 text-left hover:shadow-md hover:bg-zinc-900/20 group relative overflow-hidden transition-all duration-200 cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-850 flex items-center justify-center shrink-0 text-zinc-400 group-hover:text-indigo-400">
                              <Shield className="w-3.5 h-3.5" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="font-bold text-white text-[11.5px]">{cmd.label}</p>
                              <p className="text-[10.5px] text-zinc-500 leading-normal">{cmd.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* UTILITY NOTIFICATIONS */}
                    <div className="space-y-3 pt-2">
                      <span className="text-[9.5px] text-zinc-550 uppercase tracking-widest font-mono font-bold block">3. Diagnostics & Media Utilities</span>
                      
                      {/* Wallpaper preview block input */}
                      <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-850 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                        <div className="space-y-0.5">
                          <label className="text-[10px] uppercase font-mono text-zinc-500 font-bold block">Wallpaper Resource Url</label>
                          <input 
                            type="text" 
                            value={activeWallpaperUrl}
                            onChange={(e) => setActiveWallpaperUrl(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 text-[10.5px] text-zinc-300 outline-none focus:border-indigo-600"
                          />
                        </div>
                        <div className="flex gap-2 items-center">
                          <img 
                            src={activeWallpaperUrl} 
                            alt="Wallpaper Preview" 
                            className="w-10 h-10 rounded border border-zinc-800 object-cover shrink-0" 
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-[10px] text-zinc-500 font-sans">Required collateral wallpaper for locked states</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {COMMAND_PRESETS.filter(p => p.category === 'utility').map(cmd => (
                          <button
                            key={cmd.type}
                            onClick={() => onTriggerCommand(activeDev.id, cmd.type, cmd.type === 'SET_WALLPAPER' ? { url: activeWallpaperUrl } : undefined)}
                            className="bg-zinc-950 border border-zinc-900 hover:border-zinc-750 p-3 rounded-2xl flex items-start gap-3 text-left hover:shadow-md hover:bg-zinc-900/20 group relative overflow-hidden transition-all duration-200 cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-850 flex items-center justify-center shrink-0 text-zinc-400 group-hover:text-indigo-400">
                              <Play className="w-3.5 h-3.5" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="font-bold text-white text-[11.5px]">{cmd.label}</p>
                              <p className="text-[10.5px] text-zinc-500 leading-normal">{cmd.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Command Logs Queue subdrawer */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-zinc-800/80 pb-3">
                      <div>
                        <h4 className="font-bold text-white text-xs uppercase tracking-wide">Live Command Audit & Ack Logs</h4>
                        <p className="text-[10px] text-zinc-550 mt-0.5">Real-time reports representing Firebase FCM messages pushed to device receivers</p>
                      </div>
                      
                      {deviceCmds.length > 0 && (
                        <button
                          onClick={() => onClearCommandLogs(activeDev.id)}
                          className="text-rose-450 hover:text-rose-500 hover:underline font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          <Trash className="w-3.5 h-3.5" />
                          Purge Device Logs
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {deviceCmds.map((cmd) => (
                        <div key={cmd.id} className="bg-zinc-950 p-3 rounded-xl border border-zinc-858 flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full ring-2 ${
                              cmd.status === 'executed' 
                                ? 'bg-emerald-450 ring-emerald-500/20 font-bold' 
                                : cmd.status === 'pending' 
                                  ? 'bg-amber-450 ring-amber-500/20 animate-pulse' 
                                  : 'bg-indigo-500 ring-indigo-500/20'
                            }`} />
                            
                            <div className="font-sans">
                              <p className="font-bold text-zinc-200 uppercase text-[11px] font-mono">{cmd.commandType}</p>
                              <p className="text-[9.5px] text-zinc-500">{new Date(cmd.createdAt).toLocaleString()} • Pushed via Cloud Run</p>
                            </div>
                          </div>

                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            cmd.status === 'executed' 
                              ? 'bg-emerald-950 border border-emerald-900 text-emerald-400' 
                              : cmd.status === 'pending' 
                                ? 'bg-amber-950 border border-amber-900 text-amber-500' 
                                : 'bg-zinc-900 border border-zinc-850 text-zinc-400'
                          }`}>
                            {cmd.status === 'executed' ? 'ACK: Exe OK' : cmd.status}
                          </span>
                        </div>
                      ))}

                      {deviceCmds.length === 0 && (
                        <p className="p-8 text-center text-zinc-650 italic text-[11px] font-medium font-sans">
                          No previous push commands generated for this device. Select standard presets above.
                        </p>
                      )}
                    </div>
                  </div>

                </div>
              );
            })()
          ) : (
            <div className="h-full bg-slate-900/60 border border-slate-800 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center relative select-none">
              <Shield className="w-12 h-12 text-zinc-700 animate-pulse mb-3" />
              <h3 className="font-bold text-white text-sm">Sandbox Device Console Idle</h3>
              <p className="text-zinc-500 text-xs px-8 mt-1 max-w-[340px] leading-relaxed">
                Select an active device fleet ledger row in the left-hand directory to display the detailed remote commands panel and execute DPC security overrides.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
