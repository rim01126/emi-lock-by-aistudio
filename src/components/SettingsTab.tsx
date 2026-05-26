import React, { useState } from 'react';
import { Shop, Profile } from '../types';
import { Settings, Shield, Edit, UserPlus, Sliders, Palette, Check, Save } from 'lucide-react';

interface SettingsTabProps {
  shop: Shop;
  profiles: Profile[];
  onUpdateShop: (updatedShop: Shop) => void;
  onAddStaff: (profile: Profile) => void;
}

export default function SettingsTab({
  shop,
  profiles,
  onUpdateShop,
  onAddStaff,
}: SettingsTabProps) {
  
  // States: Edits info
  const [shopName, setShopName] = useState(shop.name);
  const [supportNumber, setSupportNumber] = useState(shop.supportNumber);
  const [address, setAddress] = useState(shop.address);
  const [themeColor, setThemeColor] = useState(shop.themeColor);
  const [logoText, setLogoText] = useState(shop.logoText);
  const [gstNumber, setGstNumber] = useState(shop.gstNumber);

  // States: Add Staff member
  const [showAddStaffForm, setShowAddStaffForm] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  
  // Filters active staff for current Active shop
  const shopProfiles = profiles.filter(p => p.shopId === shop.id);

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !supportNumber) {
      alert("Error: Shop Name and Support lines are strictly mandatory.");
      return;
    }

    const updated: Shop = {
      ...shop,
      name: shopName,
      supportNumber,
      address,
      themeColor,
      logoText,
      gstNumber
    };

    onUpdateShop(updated);
    alert(`🎉 branding overrides successfully updated for "${shopName}"! Main dashboard theme was updated.`);
  };

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail) {
      alert("Please complete required staff items.");
      return;
    }

    const newStaff: Profile = {
      id: `user-${Date.now()}`,
      shopId: shop.id,
      fullName: newStaffName,
      role: 'staff',
      email: newStaffEmail
    };

    onAddStaff(newStaff);
    
    // Clear inputs
    setNewStaffName('');
    setNewStaffEmail('');
    setShowAddStaffForm(false);
    alert(`👤 Registered "${newStaffName}" as assistant staff member for ${shop.name}! API permissions are assigned.`);
  };

  const PRESET_THEMES = [
    { name: 'Cosmic Indigo', color: '#4f46e5' },
    { name: 'Sai Emerald', color: '#059669' },
    { name: 'Royal Crimson', color: '#dc2626' },
    { name: 'Amber Solar', color: '#d97706' },
    { name: 'Ocean Teal', color: '#0d9488' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Overview */}
      <div>
        <h2 className="text-lg font-bold text-white">Multi-Shop Branding Context Settings</h2>
        <p className="text-zinc-500 text-xs">Configure matching logo overlays, primary theme colors, active store support lines, and staff permissions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Modify Shop Info */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 lg:col-span-2 space-y-4">
          <div className="border-b border-zinc-800 pb-2.5 flex items-center justify-between">
            <h3 className="font-bold text-white text-xs uppercase tracking-wide flex items-center gap-2">
              <Sliders className="w-4.5 h-4.5 text-indigo-400" />
              Store Configuration Parameters
            </h3>
            <span className="text-[10px] font-mono text-zinc-550 font-bold">Shop ID: {shop.id}</span>
          </div>

          <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono text-zinc-500 font-bold">Trading Brand Name *</label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-white outline-none focus:border-indigo-650"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono text-zinc-500 font-bold">Primary Support Calling Line *</label>
                <input
                  type="text"
                  required
                  value={supportNumber}
                  onChange={(e) => setSupportNumber(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-white outline-none focus:border-indigo-650"
                />
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono text-zinc-500 font-bold">Gujarat GST Identification *</label>
                <input
                  type="text"
                  required
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-white outline-none focus:border-indigo-650 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono text-zinc-500 font-bold">Launcher Bezel logo Text</label>
                <input
                  type="text"
                  value={logoText}
                  onChange={(e) => setLogoText(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-white outline-none focus:border-indigo-650"
                />
              </div>

            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono text-zinc-500 font-bold">Store Physical Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-white outline-none focus:border-indigo-650"
              />
            </div>

            {/* Themes presets */}
            <div className="space-y-2 pt-2 border-t border-zinc-900">
              <label className="text-[10px] uppercase font-mono text-zinc-500 font-bold flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-zinc-400" />
                Active Branding Color Scheme (Changes background layouts)
              </label>
              
              <div className="flex flex-wrap gap-2">
                {PRESET_THEMES.map((theme) => {
                  const isChecked = themeColor === theme.color;

                  return (
                    <button
                      type="button"
                      key={theme.color}
                      onClick={() => setThemeColor(theme.color)}
                      className={`py-1.5 px-3 rounded-xl border flex items-center gap-2 text-[10.5px] transition-all font-semibold ${
                        isChecked 
                          ? 'bg-zinc-950 text-white' 
                          : 'bg-zinc-950/40 border-zinc-850 text-zinc-450 hover:text-white'
                      }`}
                      style={{ borderColor: isChecked ? theme.color : undefined }}
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.color }} />
                      {theme.name}
                      {isChecked && <Check className="w-3.5 h-3.5 text-emerald-450" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-right pt-3 border-t border-zinc-805">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-5 rounded-xl shadow-md transition-all flex items-center gap-1 ml-auto cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Acknowledge & Update Settings
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Staff Roster Management */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 col-span-1 space-y-4">
          <div className="border-b border-zinc-800 pb-2.5 flex justify-between items-center">
            <h3 className="font-bold text-white text-xs uppercase tracking-wide flex items-center gap-2">
              <Shield className="w-4.5 h-4.5 text-emerald-400 font-bold" />
              Active store Staff rosters
            </h3>
            
            <button
              onClick={() => setShowAddStaffForm(!showAddStaffForm)}
              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {showAddStaffForm ? 'Cancel' : 'Enroll Staff'}
            </button>
          </div>

          {/* Form to add staff */}
          {showAddStaffForm && (
            <form onSubmit={handleAddStaffSubmit} className="bg-zinc-950 p-4.5 rounded-2xl border border-zinc-850 space-y-3 animate-fade-in text-xs">
              <div className="space-y-1">
                <label className="text-[9.5px] uppercase font-mono text-zinc-500 block">Staff Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ketan Shah"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white outline-none focus:border-indigo-650 text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] uppercase font-mono text-zinc-500 block">Roster Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ketan@gmail.com"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white outline-none focus:border-indigo-650 text-[11px]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 rounded-lg text-[10.5px]"
              >
                Grant Access Permissions
              </button>
            </form>
          )}

          {/* Roster profiles */}
          <div className="space-y-2.5">
            {shopProfiles.map((prof) => (
              <div key={prof.id} className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-858 flex items-center justify-between text-xs font-sans">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-white text-[12px]">{prof.fullName}</h4>
                  <p className="text-[10px] text-zinc-500 font-mono">{prof.email}</p>
                </div>

                <span className={`text-[9.5px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border ${
                  prof.role === 'owner' 
                    ? 'bg-indigo-950 border-indigo-900 text-indigo-400' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}>
                  {prof.role}
                </span>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
