import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Wifi, WifiOff, Battery, ShieldAlert, KeyRound, Radio, PhoneCall, CheckCircle, Cpu, Shield, AlertTriangle, Play, Volume2 } from 'lucide-react';
import { Device, Loan } from '../types';

interface CustomerAppPhoneProps {
  device: Device;
  loan: Loan | null;
  onSimulateLockState: (locked: boolean, level: 1 | 2 | 3 | 4) => void;
  onSimulateIntegrityAlert: (type: 'root' | 'magisk' | 'bootloader_unlock' | 'usb_debugging' | 'fake_gps' | 'safe_mode', desc: string) => void;
  onSimulateSimChange: (oldNumber: string, newNumber: string) => void;
  onDeviceUpdate: (device: Partial<Device>) => void;
}

// Generate the unique daily code for the offline unlock system (matches Kotlin code)
export function getDailyCode(secret: string): string {
  const date = new Date();
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = String(date.getUTCFullYear()).slice(-2);
  const dateStr = `${day}${month}${year}`; // ddMMyy format
  
  // Simple deterministic daily hash of secret + dateStr
  const input = `${secret}-${dateStr}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const positiveHash = Math.abs(hash).toString(16).toUpperCase();
  return (positiveHash + '999999').slice(0, 6);
}

export default function CustomerAppPhone({
  device,
  loan,
  onSimulateLockState,
  onSimulateIntegrityAlert,
  onSimulateSimChange,
  onDeviceUpdate,
}: CustomerAppPhoneProps) {
  const [offlineCode, setOfflineCode] = useState('');
  const [offlineAttempts, setOfflineAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [showDialer, setShowDialer] = useState(false);
  const [dialString, setDialString] = useState('');
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [dialMessage, setDialMessage] = useState('');
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [gujaratiSpeechText, setGujaratiSpeechText] = useState('');
  const [showPhoneApp, setShowPhoneApp] = useState(false);
  const [phoneDialString, setPhoneDialString] = useState('');
  const [phoneCallActive, setPhoneCallActive] = useState<string | null>(null);
  
  // Offline keys generator display
  const dailyCode = getDailyCode(device.offlineUnlockSecret);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutTimer > 0) {
      const interval = setInterval(() => {
        setLockoutTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutTimer]);

  // Gujarati voice notification synthesis simulation
  const playGujaratiVoice = () => {
    if (voicePlaying) return;
    setVoicePlaying(true);
    
    const overdueTextEnglish = loan 
      ? `Dear Customer, your EMI installment of Rupees ${loan.monthlyEmiAmount} was due on ${loan.nextDueDate}. Please pay immediately to prevent lock.`
      : "EMI Overdue Warning";
      
    const textGujarati = loan
      ? `માનનીય ગ્રાહક, આપનું ઈ.એમ.આઈ. હપ્તા ${loan.monthlyEmiAmount} રૂપિયા, તારીખ ${loan.nextDueDate} ના રોજ બાકી થયેલ છે. કૃપા કરીને ફોનને લોક થતો બચાવવા માટે તુરંત જ ચુકવણી કરો.`
      : "તમારા ઈ.એમ.આઈ ઓવરડ્યુ છે. મહેરબાની કરીને હપ્તો ભરો.";

    setGujaratiSpeechText(textGujarati);

    // Dynamic browser speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Try to find a Gujarati voice, fall back to default Indian English if unavailable
      const utterance = new SpeechSynthesisUtterance(textGujarati);
      utterance.lang = 'gu-IN';
      const voices = window.speechSynthesis.getVoices();
      const gujaratiVoice = voices.find(v => v.lang.startsWith('gu'));
      if (gujaratiVoice) {
        utterance.voice = gujaratiVoice;
      } else {
        // Fallback text in Hindi/English if Gujarati local synthesizers aren't fully resolved
        utterance.lang = 'hi-IN';
        utterance.text = `कृपया ध्यान दें। आपका ईएमआई हफ्ता ${loan?.monthlyEmiAmount} रुपये का पेमेंट पेंडिंग है। तुरंत जमा करें।`;
      }
      utterance.onend = () => {
        setVoicePlaying(false);
        setGujaratiSpeechText('');
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        setVoicePlaying(false);
        setGujaratiSpeechText('');
      }, 5000);
    }
  };

  const handleDialPress = (num: string) => {
    if (dialString.length < 15) {
      setDialString(prev => prev + num);
    }
  };

  const deleteDialChar = () => {
    setDialString(prev => prev.slice(0, -1));
  };

  const handleCall = () => {
    if (dialString === '*#123#') {
      setShowDiagnostics(true);
      setShowDialer(false);
      setDialString('');
    } else {
      setDialMessage(`Dialing ${dialString}... Not standard code. Standard stealth code is *#123#`);
      setTimeout(() => setDialMessage(''), 4000);
    }
  };

  const handleOfflineUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;

    if (offlineCode.toUpperCase() === dailyCode) {
      // success, trigger unlock through parent
      onSimulateLockState(false, 1);
      setOfflineAttempts(0);
      setOfflineCode('');
      alert("✅ Device successfully unlocked offline via 6-digit daily validation key!");
    } else {
      // failed attempt
      const nextAttempts = offlineAttempts + 1;
      setOfflineAttempts(nextAttempts);
      setOfflineCode('');
      if (nextAttempts >= 5) {
        setLockoutTimer(30 * 60); // 30 minutes lockout
        alert("🚨 Maximum 5 failed attempts! Phone secure locked for 30 minutes.");
      } else {
        alert(`❌ Incorrect unlock key! Attempt ${nextAttempts} of 5. Please obtain matching device key.`);
      }
    }
  };

  const triggerTampering = (type: 'root' | 'magisk' | 'usb_debugging' | 'fake_gps' | 'safe_mode', desc: string) => {
    onSimulateIntegrityAlert(type, desc);
  };

  const triggerSimChange = () => {
    const randomNumbers = ['+91 91045 99014', '+91 94220 10291', '+91 99059 44321', '+91 97721 04222'];
    const chosen = randomNumbers[Math.floor(Math.random() * randomNumbers.length)];
    onSimulateSimChange(device.serialNumber, chosen);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center">
      {/* Device Bezel Box */}
      <div className="relative w-[340px] h-[670px] bg-slate-900 rounded-[50px] border-[12px] border-slate-950 p-2 shadow-2xl ring-4 ring-indigo-500/30 flex flex-col justify-between overflow-hidden">
        {/* Notch Speaker */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-32 h-5 bg-slate-950 rounded-b-2xl z-50 flex items-center justify-center">
          <div className="w-12 h-1 bg-zinc-800 rounded-full" />
          <div className="w-2.5 h-2.5 bg-sky-950 rounded-full ml-3 border border-sky-900" />
        </div>

        {/* Screen Content Wrapper */}
        <div className="w-full h-full rounded-[40px] bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden text-xs pb-4">
          
          {/* Top Status Bar Controls */}
          <div className="px-5 pt-4 pb-2 flex items-center justify-between text-[11px] font-mono text-zinc-400 bg-slate-950/90 select-none z-10 border-b border-zinc-900">
            <span>07:30 UTC</span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-indigo-400 font-bold px-1.5 py-0.2 bg-indigo-950 rounded border border-indigo-800/60">DPC Owner</span>
              <button 
                onClick={() => onDeviceUpdate({ internetConnected: !device.internetConnected })}
                title="Toggle Network Connection"
                className="hover:text-white"
              >
                {device.internetConnected ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-rose-500" />}
              </button>
              <div className="flex items-center gap-1">
                <Battery className="w-3.5 h-3.5 text-zinc-400" />
                <span>{device.batteryLevel}%</span>
              </div>
            </div>
          </div>

          {/* Core Interactive Device Display Areas */}
          <div className="flex-1 relative overflow-y-auto px-4 py-3 flex flex-col justify-start">
            
            {/* Speach Overlay Box */}
            <AnimatePresence>
              {gujaratiSpeechText && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-x-3 top-2 bg-indigo-900 border border-indigo-500 rounded-xl p-3 shadow-lg z-50 text-center"
                >
                  <p className="font-semibold text-indigo-200 flex items-center justify-center gap-2 mb-1 animate-pulse">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    Gujarati Voice Broadcast
                  </p>
                  <p className="text-[11px] leading-relaxed italic text-white font-sans">{gujaratiSpeechText}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* IF STATUS IS LOCKED LEVEL 4 (Full System Block) */}
            {device.isLocked && device.lockLevel === 4 ? (
              <div className="flex-1 flex flex-col justify-between text-center select-none pt-4">
                <div className="flex-1 flex flex-col items-center justify-center p-2">
                  <div className="w-14 h-14 bg-rose-950 border border-rose-500 text-rose-400 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse">
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                  
                  <span className="text-[10px] uppercase tracking-wider text-rose-400 font-mono font-bold px-2 py-0.5 bg-rose-950 border border-rose-900 rounded mb-2">
                    Security Policy Level 4
                  </span>
                  
                  <h2 className="text-lg font-bold font-sans tracking-tight text-white px-2">
                    DEVICE SECURE LOCKED
                  </h2>
                  <p className="text-zinc-400 font-sans mt-1 p-1">
                    Your phone is locked because your EMI payment is strictly overdue.
                  </p>

                  {/* Dual Language Language Box */}
                  <div className="bg-zinc-900/95 border border-zinc-800 rounded-xl p-3 w-full my-4 text-left font-sans">
                    <div className="mb-2.5 pb-2.5 border-b border-zinc-800/80">
                      <p className="text-[10px] text-zinc-500 font-semibold">ENGLISH INSTRUCTIONS</p>
                      <p className="font-semibold text-zinc-200 text-[11px] mt-0.5">
                        Please pay EMI of <span className="text-emerald-400">₹{loan?.monthlyEmiAmount || '2,100'}</span> to instantly unlock.
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 font-semibold">ગુજરાતી સૂચનાઓ (GUJARATI)</p>
                      <p className="font-semibold text-indigo-300 text-[11px] mt-0.5 leading-relaxed">
                        કૃપા કરીને રકમ <span className="text-amber-400 font-bold">₹{loan?.monthlyEmiAmount || '2,100'}</span> ચૂકવી ફોન લોક હોથી મુક્ત કરો.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Secure Actions Footer */}
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${loan ? '9876543210' : '9900088222'}`}
                      className="flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 py-2.5 px-3 rounded-xl font-medium tracking-tight"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-zinc-400" />
                      Call Store
                    </a>
                    
                    <button
                      onClick={() => setShowDialer(true)}
                      className="flex items-center justify-center gap-2 bg-indigo-950 border border-indigo-800 text-indigo-400 hover:bg-indigo-900/65 py-2.5 px-3 rounded-xl font-medium tracking-tight"
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      Stealth Dialer
                    </button>
                  </div>

                  {/* Offline Unlock Drawer Toggle */}
                  <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-2xl text-left font-sans">
                    <p className="font-bold text-slate-200 text-[11px] flex items-center gap-2 mb-2">
                      <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                      Offline Unlock Key Verification
                    </p>
                    
                    {lockoutTimer > 0 ? (
                      <div className="bg-rose-950/60 text-rose-300 text-[11px] p-2 rounded-lg text-center font-mono border border-rose-900">
                        Input Blocked! Try again in {formatTime(lockoutTimer)}
                      </div>
                    ) : (
                      <form onSubmit={handleOfflineUnlockSubmit} className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="ENTER 6-DIGIT KEY"
                          value={offlineCode}
                          onChange={(e) => setOfflineCode(e.target.value.toUpperCase())}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-center font-mono tracking-widest text-[13px] text-white placeholder-zinc-700 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                        />
                        <button
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 rounded-lg text-[11px] font-semibold"
                        >
                          Unlock
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            ) : device.isLocked && device.lockLevel === 3 ? (
              /* PARTIAL LOCK: Allow Calls, UPI Apps, Support Contact */
              <div className="flex-1 flex flex-col justify-between pt-4">
                <div className="text-center p-2">
                  <div className="w-12 h-12 bg-amber-950/60 border border-amber-500 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                  </div>
                  <h3 className="text-sm font-bold text-white">EMI Overdue - Level 3</h3>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Partial Lock Active. Basic calling and Payment Apps enabled for convenience.
                  </p>
                  
                  <div className="mt-4 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-left">
                    <p className="font-semibold text-zinc-300 text-[11px]">Due Installment:</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[11px] text-zinc-400">Monthly Payment:</span>
                      <span className="font-bold text-emerald-400">₹{loan?.monthlyEmiAmount}</span>
                    </div>
                    <div className="flex justify-between items-center mt-0.5">
                      <span className="text-[11px] text-zinc-400">Due Date:</span>
                      <span className="font-semibold text-rose-400">{loan?.nextDueDate}</span>
                    </div>
                  </div>
                </div>

                {/* Only Approved App Interfaces are interactive */}
                <div className="space-y-3">
                  <p className="text-[10px] text-zinc-500 tracking-wider uppercase font-semibold font-mono text-center">Approved Apps Allowed</p>
                  <div className="grid grid-cols-2 gap-3.5 font-sans">
                    {/* Google Pay */}
                    <button 
                      onClick={() => alert(`Simulating UPI pay of ₹${loan?.monthlyEmiAmount || '2100'} via Android Intent...`)}
                      className="bg-emerald-950/70 border border-emerald-800/80 hover:bg-emerald-900/80 text-emerald-400 rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5"
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-xs border border-emerald-500/20">
                        ₹
                      </div>
                      <span className="text-[10px] font-semibold text-zinc-200">Payment App</span>
                    </button>

                    {/* Support Call */}
                    <a 
                      href={`tel:${loan ? '9876543210' : '9900088222'}`}
                      className="bg-indigo-950/60 border border-indigo-900 hover:bg-indigo-900/60 text-indigo-400 rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5"
                    >
                      <PhoneCall className="w-4 h-4 text-indigo-400" />
                      <span className="text-[10px] font-semibold text-zinc-200">Phone App</span>
                    </a>
                  </div>

                  <div className="flex justify-between items-center bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-xl">
                    <span className="text-[10px] text-zinc-400">Need Offline Key?</span>
                    <button 
                      onClick={() => alert(`Provide this secret to store admin: ${device.offlineUnlockSecret}\nThey will generate daily key: ${dailyCode}`)}
                      className="text-amber-400 font-semibold hover:underline text-[10px]"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ) : device.isLocked && device.lockLevel === 2 ? (
              /* SOCIAL APPS SUSPENDED MODE */
              <div className="flex-1 flex flex-col justify-between pt-2">
                <div className="bg-indigo-950/40 border border-indigo-900/80 rounded-xl p-3 text-center mb-3">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase font-mono bg-indigo-950 px-2 py-0.5 rounded border border-indigo-900">
                    Policy Level 2 Active
                  </span>
                  <p className="text-[11px] text-zinc-300 font-semibold mt-1.5">Social Apps Suspended</p>
                  <p className="text-[10.5px] text-zinc-400 font-sans mt-0.5">
                    Your store admin suspended WhatsApp, Facebook, Instagram, and YouTube.
                  </p>
                </div>

                {/* Suspended Grid Mockup */}
                <div className="grid grid-cols-3 gap-3 my-4">
                  {[
                    { name: 'WhatsApp', icon: '💬', suspended: true },
                    { name: 'Facebook', icon: '🔵', suspended: true },
                    { name: 'Instagram', icon: '📸', suspended: true },
                    { name: 'Youtube', icon: '📺', suspended: true },
                    { name: 'G-Pay', icon: '💸', suspended: false },
                    { name: 'Contacts', icon: '👤', suspended: false },
                  ].map((app, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        if (app.suspended) {
                          alert(`🚫 Device Owner blocks "${app.name}": Suspended under current overdue policy level.`);
                        } else {
                          alert(`Opening ${app.name}... Allowed under lock level 2!`);
                        }
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded-2xl relative cursor-pointer border ${
                        app.suspended 
                          ? 'bg-zinc-900/30 border-zinc-800 text-zinc-650 opacity-40' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                      }`}
                    >
                      <span className="text-xl">{app.icon}</span>
                      <span className="text-[9px] mt-1 truncate max-w-full text-center">{app.name}</span>
                      
                      {app.suspended && (
                        <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-rose-600 rounded-full flex items-center justify-center border border-slate-950">
                          <span className="text-[8px] text-white font-bold font-sans">×</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Reminder Bar */}
                <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl font-sans text-left mt-auto">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="font-bold text-zinc-300 text-[10.5px]">Device Managed Secured</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-normal">
                    This block resolves automatically once our cloud system receives installment payment of ₹{loan?.monthlyEmiAmount}.
                  </p>
                </div>
              </div>
            ) : (
              /* REGULAR DEFAULT DEVICE HOMEPAGE */
              <div className="flex-1 flex flex-col justify-between pt-2">
                
                {/* Level 1 Overdue Notification inside Home screen */}
                {loan?.status === 'overdue' && (
                  <div className="bg-amber-950/80 border border-amber-650 rounded-xl p-2.5 mb-3 flex items-start gap-2 text-amber-300 shadow-md">
                    <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="flex-1 font-sans text-left">
                      <p className="font-bold text-[11px] text-white">EMI Overdue - Notice 1</p>
                      <p className="text-[10px] text-amber-300/90 leading-tight">
                        Installment of ₹{loan.monthlyEmiAmount} is late. Pay now to prevent service block. કૃપા કરીને EMI ચૂકવો.
                      </p>
                    </div>
                  </div>
                )}

                {/* Home App Draw Grid */}
                <div className="grid grid-cols-4 gap-3 my-4">
                  {[
                    { name: 'Phone', i: '📞', app: 'phone' },
                    { name: 'Browser', i: '🌐', app: 'browser' },
                    { name: 'Settings', i: '⚙️', app: 'settings' },
                    { name: 'WhatsApp', i: '💬', app: 'whatsapp' },
                    { name: 'Instagram', i: '📸', app: 'ig' },
                    { name: 'S-Lock DPC', i: '🛡️', app: 'dpc' },
                  ].map((n, i) => (
                    <div 
                      key={i}
                      onClick={() => {
                        if (n.app === 'phone') {
                          setShowPhoneApp(true);
                        } else if (n.app === 'dpc') {
                          setShowDiagnostics(true);
                        } else {
                          alert(`Simulator: Opening standard app "${n.name}". It is currently fully allowed.`);
                        }
                      }}
                      className="flex flex-col items-center p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 select-none cursor-pointer"
                    >
                      <span className="text-lg">{n.i}</span>
                      <span className="text-[9px] mt-1 text-zinc-400 truncate w-full text-center">{n.name}</span>
                    </div>
                  ))}
                </div>

                {/* Home Display Branding Box */}
                <div className="mt-auto bg-gradient-to-br from-zinc-950 to-slate-900/60 border border-slate-800/80 p-3 rounded-2xl text-left">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-semibold mb-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span>EMI Secure Lock</span>
                  </div>
                  <p className="text-zinc-500 text-[10px] leading-relaxed">
                    Android Device Owner policy is verified active. No tampering detected. Device is synchronized.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* PHYSICAL DIALER OVERLAY MOCKUP (FOR LAUNCHING STEALTH DIAGNOSTICS) */}
          <AnimatePresence>
            {showDialer && (
              <motion.div 
                initial={{ opacity: 0, y: 150 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 150 }}
                className="absolute inset-0 bg-slate-950/98 text-white p-4 font-sans flex flex-col justify-between z-45 rounded-[40px] pt-14"
              >
                <div className="text-center pt-2">
                  <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono font-bold">Stealth Diagnostics Launcher</p>
                  <p className="text-[10px] text-indigo-400 mt-1 px-4 leading-normal">
                    Secure diagnostic console opens by dialing the secret engineer code: <span className="font-mono font-bold text-white bg-slate-900 px-1.5 py-0.5 my-0.5 rounded">*#123#</span>
                  </p>
                  <div className="h-10 text-xl font-mono text-center tracking-widest font-bold mt-4 border-b border-zinc-900 text-purple-400 flex items-center justify-center gap-2">
                    {dialString || <span className="text-zinc-700 animate-pulse">Dial System Code</span>}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3.5 my-3 max-w-[240px] mx-auto">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(val => (
                    <button
                      key={val}
                      onClick={() => handleDialPress(val)}
                      className="w-12 h-12 rounded-full bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 text-lg flex items-center justify-center font-semibold text-zinc-200 border border-zinc-800/50"
                    >
                      {val}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center px-4">
                  <button 
                    onClick={() => { setShowDialer(false); setDialString(''); }}
                    className="text-zinc-500 hover:text-white text-[11px]"
                  >
                    Cancel
                  </button>
                  
                  <button 
                    onClick={handleCall}
                    className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Radio className="w-5 h-5 text-white" />
                  </button>

                  <button 
                    onClick={deleteDialChar}
                    className="text-zinc-500 hover:text-white text-[11px]"
                  >
                    Delete
                  </button>
                </div>

                {dialMessage && (
                  <p className="text-center text-rose-400 text-[10px] mt-2 italic px-2">{dialMessage}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* PHONE CALL APP MODAL (FOR REGULAR APPROVED CALLS) */}
          <AnimatePresence>
            {showPhoneApp && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900 text-white p-5 font-sans z-45 rounded-[40px] pt-14 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                    <span className="font-bold text-xs">Standard Dialer App</span>
                    <button onClick={() => { setShowPhoneApp(false); setPhoneDialString(''); setPhoneCallActive(null); }} className="text-zinc-500 hover:text-white text-xs bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">Exit App</button>
                  </div>

                  {phoneCallActive ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-emerald-900 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 mb-4 animate-bounce">
                        <PhoneCall className="w-8 h-8" />
                      </div>
                      <p className="font-bold text-sm">CALL ACTIVE</p>
                      <p className="text-zinc-400 text-xs mt-1 font-mono">{phoneCallActive}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Calling Authorized Support Line...</p>
                    </div>
                  ) : (
                    <div>
                      <div className="h-10 text-lg font-mono text-center tracking-widest mt-4 text-emerald-400 border-b border-zinc-800 flex items-center justify-center">
                        {phoneDialString || <span className="text-zinc-600">Enter Number</span>}
                      </div>

                      <div className="grid grid-cols-3 gap-2.5 my-4 max-w-[200px] mx-auto text-xs">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(val => (
                          <button
                            key={val}
                            onClick={() => { if (phoneDialString.length < 11) setPhoneDialString(prev => prev + val) }}
                            className="w-10 h-10 rounded-full bg-zinc-950 hover:bg-zinc-900 text-zinc-300 flex items-center justify-center"
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {!phoneCallActive ? (
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => {
                        if (phoneDialString) {
                          setPhoneCallActive(phoneDialString);
                        } else {
                          alert("Dial some digits first!");
                        }
                      }}
                      className="bg-emerald-600 px-6 py-2 rounded-xl text-xs font-semibold"
                    >
                      Call Approved Line
                    </button>
                    <button
                      onClick={() => setPhoneDialString('')}
                      className="bg-zinc-800 text-xs text-zinc-400 px-4 py-2 rounded-xl"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setPhoneCallActive(null)}
                    className="bg-rose-600 hover:bg-rose-700 py-2.5 rounded-xl text-xs font-bold w-full"
                  >
                    End Call
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* DPC OWNER SYSTEM DIAGNOSTICS PAGE (STEALTH SCREEN) */}
          <AnimatePresence>
            {showDiagnostics && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-zinc-950 text-white p-5 font-mono z-50 rounded-[40px] pt-14 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-2 mb-4">
                    <span className="text-zinc-400 font-bold text-[10px] flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-indigo-400" />
                      ESL Diagnostics
                    </span>
                    <button 
                      onClick={() => setShowDiagnostics(false)} 
                      className="text-zinc-500 hover:text-white text-[9px] bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded"
                    >
                      Close Sys
                    </button>
                  </div>

                  {/* Diagnostic details */}
                  <div className="space-y-2.5 text-[9.5px]">
                    <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                      <span className="text-zinc-500">DPC Owner Status:</span>
                      <span className="text-emerald-400 font-sans font-bold flex items-center gap-1">
                        Active Mode
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                      <span className="text-zinc-500">Policy Target:</span>
                      <span className="text-zinc-300">Level {device.lockLevel} {device.isLocked ? '(Enforced)' : '(Permitted)'}</span>
                    </div>

                    <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                      <span className="text-zinc-500">Firebase FCM:</span>
                      <span className={device.internetConnected ? "text-emerald-400" : "text-rose-500"}>
                        {device.internetConnected ? "Connected (Listening)" : "No Connection"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                      <span className="text-zinc-500">Server API Ping:</span>
                      <span className={device.internetConnected ? "text-emerald-400" : "text-rose-500"}>
                        {device.internetConnected ? "OK (38ms)" : "Failed"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                      <span className="text-zinc-500">Anti-Uninstall:</span>
                      <span className="text-indigo-400">Locked (Flag ON)</span>
                    </div>

                    <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                      <span className="text-zinc-500">USB Debug Block:</span>
                      <span className={device.usbTransferBlocked ? "text-emerald-400" : "text-amber-500"}>
                        {device.usbTransferBlocked ? "Enforced (Disallow)" : "Standard Allowed"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                      <span className="text-zinc-500">Factory Reset:</span>
                      <span className="text-rose-400 font-bold">DISALLOWED (Block)</span>
                    </div>

                    <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                      <span className="text-zinc-500">IMEI1:</span>
                      <span className="text-zinc-300 font-sans text-[9px]">{device.imei1}</span>
                    </div>

                    <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                      <span className="text-zinc-500">Security Seed:</span>
                      <span className="text-amber-500 text-[9px]">{device.offlineUnlockSecret}</span>
                    </div>

                    <div className="flex justify-between pb-1">
                      <span className="text-zinc-500">Sync Timestamp:</span>
                      <span className="text-zinc-400 font-sans">{new Date(device.lastOnline).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 bg-zinc-900 p-2 text-center rounded border border-zinc-850">
                    <p className="text-[8.5px] text-zinc-500">TODAY'S OFFLINE CODE GENERATED</p>
                    <p className="text-base font-bold tracking-widest text-white mt-1">{dailyCode}</p>
                    <p className="text-[8.5px] text-zinc-500 mt-1 uppercase font-semibold">Give to customer if offline</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[8.5px] text-zinc-500 text-center font-bold">EMULATED ADMIN PUSH COMMANDS</p>
                  <div className="grid grid-cols-2 gap-1.5 text-[9px] font-sans">
                    <button
                      onClick={() => { onDeviceUpdate({ isLocked: false }); alert('System Admin: Device is unlocked'); }}
                      className="bg-emerald-950 border border-emerald-900 text-emerald-400 rounded-lg py-1.5 font-semibold"
                    >
                      Force Cloud OK
                    </button>
                    <button
                      onClick={() => { onDeviceUpdate({ isLocked: true, lockLevel: 4 }); alert('System Admin: Forced Lock Level 4'); }}
                      className="bg-rose-950 border border-rose-900 text-rose-400 rounded-lg py-1.5 font-semibold"
                    >
                      Force Cloud Lock
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SIMULATED NOTCH LAUNCH BUTTON */}
          <div className="absolute top-1 left-2 transform w-[30px] h-[30px] z-50 flex items-center justify-center">
            <button 
              onClick={() => { setShowDialer(true); setShowDiagnostics(false); }}
              title="Stealth Dialer Pad Trigger (Simulates opening dialer on phone)"
              className="w-5.5 h-5.5 rounded-full bg-slate-950/70 border border-slate-800 hover:bg-slate-900 flex items-center justify-center"
            >
              <Phone className="w-2.5 h-2.5 text-indigo-400 hover:text-white" />
            </button>
          </div>

        </div>
      </div>

      {/* BEZEL CONTROLS FOR DIRECT LOG AND TAMPER SIMULATIONS */}
      <div className="mt-4 w-full bg-slate-900/60 border border-slate-800 p-4 rounded-3xl font-sans text-xs">
        <h4 className="font-bold text-zinc-150 mb-2 flex items-center gap-1.5 text-indigo-400">
          <ShieldAlert className="w-4 h-4" />
          DPC Android Device Owner Sandbox
        </h4>
        <p className="text-zinc-400 text-[11px] leading-relaxed mb-3">
          Simulate local phone tampering, configuration changes, or media playing. Watch how the React console logs audits instantly.
        </p>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={playGujaratiVoice}
            disabled={voicePlaying}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border font-semibold text-[11px] transition-all ${
              voicePlaying 
                ? 'bg-emerald-950 border-emerald-900 text-emerald-400 animate-pulse' 
                : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-900 text-zinc-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            {voicePlaying ? "Speech Broadcast" : "Gujarati Voice Alert"}
          </button>

          <button
            onClick={triggerSimChange}
            className="bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-zinc-200 py-2 px-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-[11px]"
          >
            <Radio className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            Simulate SIM Change
          </button>

          <button
            onClick={() => triggerTampering('root', 'Root access detected. Magisk binaries found in /system/xbin/su.')}
            className="bg-zinc-950 border border-zinc-800 hover:border-zinc-900 text-rose-450 py-2 px-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-[11px]"
          >
            <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-500" />
            Simulate Root Access
          </button>

          <button
            onClick={() => triggerTampering('usb_debugging', 'Developer Options and AVD debug flag enabled by user.')}
            className="bg-zinc-950 border border-zinc-800 hover:border-zinc-900 text-amber-450 py-2 px-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-[11px]"
          >
            <Cpu className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            Simulate USB Debug
          </button>

          <button
            onClick={() => triggerTampering('fake_gps', 'Fake mock provider active (App package: com.goplay.gpsjoystick).')}
            className="bg-zinc-950 border border-zinc-800 hover:border-zinc-900 text-zinc-200 py-2 px-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-[11px]"
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-cyan-450" />
            Simulate Mock GPS
          </button>

          <button
            onClick={() => {
              const battery = Math.max(5, Math.min(100, Math.floor(Math.random() * 95) + 5));
              onDeviceUpdate({ batteryLevel: battery });
              alert(`Simulator: Battery power updated to ${battery}%`);
            }}
            className="bg-zinc-950 border border-zinc-800 hover:bg-zinc-950 text-zinc-200 py-2 px-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-[11px]"
          >
            <Battery className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
            Randomize Battery
          </button>
        </div>

        {/* Offline codes info */}
        <div className="mt-3.5 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-850 font-mono text-[10.5px]">
          <div className="flex justify-between items-center">
            <span className="text-zinc-500">Today's Daily Code:</span>
            <span className="text-amber-400 font-bold tracking-widest">{dailyCode}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-zinc-500">Seed Secret:</span>
            <span className="text-indigo-400 font-sans text-[10px]">{device.offlineUnlockSecret}</span>
          </div>
          <p className="text-[9px] text-zinc-550 leading-relaxed mt-1.5 italic font-sans">
            *This 6-digit passcode automatically changes at 00:00 UTC and resets failure counters. Use for offline rescue.
          </p>
        </div>
      </div>
    </div>
  );
}
