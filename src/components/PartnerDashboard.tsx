import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Store, RefreshCw, MapPin, CheckCircle2, ChevronRight, Upload, Building2, Utensils, Truck } from 'lucide-react';

interface PartnerDashboardProps {
  onBack: () => void;
}

export const PartnerDashboard: React.FC<PartnerDashboardProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'onboarding' | 'inventory' | 'logistics'>('onboarding');

  return (
    <div className="py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-display font-black tracking-tight">Partner Hub</h2>
          <p className="text-slate-500 font-medium mt-2">Manage your restaurant, sync menus, and configure logistics.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-px">
        <button
          onClick={() => setActiveTab('onboarding')}
          className={`pb-4 px-2 font-bold transition-all relative ${activeTab === 'onboarding' ? 'text-primary-light' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Onboarding
          </div>
          {activeTab === 'onboarding' && (
            <motion.div layoutId="partner-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-light rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-4 px-2 font-bold transition-all relative ${activeTab === 'inventory' ? 'text-primary-light' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
        >
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Menu Sync
          </div>
          {activeTab === 'inventory' && (
            <motion.div layoutId="partner-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-light rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('logistics')}
          className={`pb-4 px-2 font-bold transition-all relative ${activeTab === 'logistics' ? 'text-primary-light' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
        >
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4" /> Logistics
          </div>
          {activeTab === 'logistics' && (
            <motion.div layoutId="partner-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-light rounded-t-full" />
          )}
        </button>
      </div>

      <div className="glass dark:glass-dark p-8 rounded-[40px] border border-slate-100 dark:border-white/5 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'onboarding' && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-display">Restaurant Onboarding</h3>
                  <p className="text-slate-500 text-sm">Register your restaurant to appear on the aggregator.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Restaurant Name</label>
                    <input type="text" className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-light/50" placeholder="e.g. The Spicy Kitchen" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">FSSAI License Number</label>
                    <input type="text" className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-light/50" placeholder="14-digit FSSAI number" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Upload Documents</label>
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-slate-400" />
                    <p className="font-bold text-slate-600 dark:text-slate-300">Click to upload FSSAI & GST certificates</p>
                    <p className="text-xs text-slate-400">PDF, JPG or PNG (max. 5MB)</p>
                  </div>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button className="bg-primary-light text-white px-8 py-3 rounded-2xl font-bold hover:bg-primary-dark transition-all">
                  Submit Application
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'inventory' && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                  <Utensils className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-display">Inventory & Menu Sync</h3>
                  <p className="text-slate-500 text-sm">Automatically sync your POS menu with our aggregator.</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-bold text-sm text-green-600 dark:text-green-400">Live Sync Active</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Last synced: 2 mins ago</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center justify-center">
                    <span className="text-3xl font-black mb-1">124</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Items</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center justify-center">
                    <span className="text-3xl font-black mb-1 text-red-500">3</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Out of Stock</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                    <button className="flex items-center gap-2 text-primary-light font-bold hover:underline">
                      <RefreshCw className="w-4 h-4" /> Force Sync
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <h4 className="font-bold mb-4">POS Integration</h4>
                <div className="flex gap-4">
                  <div className="border-2 border-primary-light/50 bg-primary-light/5 rounded-2xl p-4 flex items-center gap-3 cursor-pointer">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-lg">P</div>
                    <div>
                      <p className="font-bold text-sm">PetPooja</p>
                      <p className="text-[10px] text-green-500 font-bold uppercase">Connected</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-primary-light ml-auto" />
                  </div>
                  <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:border-primary-light/30 transition-colors">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-lg">Z</div>
                    <div>
                      <p className="font-bold text-sm">Zomato Base</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Disconnected</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'logistics' && (
            <motion.div
              key="logistics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-display">Location & Logistics</h3>
                  <p className="text-slate-500 text-sm">Set service areas and manage delivery partners.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold mb-3">Delivery Providers</h4>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <input type="radio" name="logistics" className="w-4 h-4 text-primary-light" defaultChecked />
                          <span className="font-bold text-sm">Self Delivery (In-house fleet)</span>
                        </div>
                      </label>
                      <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 cursor-pointer opacity-60">
                        <div className="flex items-center gap-3">
                          <input type="radio" name="logistics" className="w-4 h-4 text-primary-light" disabled />
                          <span className="font-bold text-sm">Shadowfax (3PL)</span>
                        </div>
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded font-bold uppercase">Coming Soon</span>
                      </label>
                      <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 cursor-pointer opacity-60">
                        <div className="flex items-center gap-3">
                          <input type="radio" name="logistics" className="w-4 h-4 text-primary-light" disabled />
                          <span className="font-bold text-sm">Dunzo (3PL)</span>
                        </div>
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded font-bold uppercase">Coming Soon</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold mb-3">Service Radius</h4>
                    <div className="flex items-center gap-4">
                      <input type="range" className="flex-1 accent-primary-light" min="1" max="15" defaultValue="5" />
                      <span className="font-black text-xl w-12 text-center">5<span className="text-sm font-medium text-slate-500">km</span></span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden relative min-h-[300px] border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  {/* Mock map representation */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-400 via-transparent to-transparent" />
                  <div className="absolute w-40 h-40 bg-primary-light/20 rounded-full border-2 border-primary-light/50 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary-light" />
                  </div>
                  <div className="relative z-10 bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-lg text-xs font-bold font-display uppercase tracking-widest text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                    Live Map Preview
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
