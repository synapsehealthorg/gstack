"use client";

import React, { useState, useEffect } from 'react';
import { CreditCard, Landmark, FileText, User as UserIcon, ShieldAlert } from 'lucide-react';
import { proovDb, User } from '@/lib/db';
import { createClient } from '@/utils/supabase/client';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'billing' | 'profile'>('billing');
  const [user, setUser] = useState<User | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [fullNameInput, setFullNameInput] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [baseUrl, setBaseUrl] = useState('app.proov.to');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.host);
    }
    
    async function loadUser() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUserEmail(authUser.email || '');
        const profile = await proovDb.getUser(authUser.id);
        if (profile) {
          setUser(profile);
          setUsernameInput(profile.username || '');
          setFullNameInput(profile.name || '');
        }
      }
    }
    loadUser();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveStatus(null);

    const sanitized = usernameInput.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
    if (!sanitized) {
      setSaveStatus({ type: 'error', message: 'Username must contain only letters, numbers, hyphens, or underscores' });
      setSaving(false);
      return;
    }

    try {
      const supabase = createClient();
      
      // Update full name in profiles table
      const { error: nameError } = await supabase
        .from('profiles')
        .update({ full_name: fullNameInput })
        .eq('id', user.id);

      if (nameError) {
        setSaveStatus({ type: 'error', message: nameError.message });
        setSaving(false);
        return;
      }

      // Update username
      const res = await proovDb.updateUsername(user.id, sanitized);
      if (!res.success) {
        setSaveStatus({ type: 'error', message: res.error || 'Failed to update username' });
      } else {
        setSaveStatus({ type: 'success', message: 'Profile updated successfully!' });
        setUser({ ...user, name: fullNameInput, username: sanitized });
        setUsernameInput(sanitized);
        
        // Notify dashboard or other components of profile updates
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('proov_profile_updated'));
        }
      }
    } catch (err: any) {
      setSaveStatus({ type: 'error', message: err.message || 'An error occurred while updating profile' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 space-y-1">
          <button 
            onClick={() => { setActiveTab('billing'); setSaveStatus(null); }}
            className={`w-full text-left px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'billing' 
                ? 'text-gray-900 bg-gray-100' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Billing & Payments
          </button>
          <button 
            onClick={() => { setActiveTab('profile'); setSaveStatus(null); }}
            className={`w-full text-left px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'profile' 
                ? 'text-gray-900 bg-gray-100' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Profile Settings
          </button>
        </div>
        
        <div className="col-span-1 md:col-span-3 space-y-6">
          {activeTab === 'billing' ? (
            <>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage your payment methods for escrow and subscriptions.</p>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Visa ending in 4242</div>
                        <div className="text-xs text-gray-500">Expires 12/2026</div>
                      </div>
                    </div>
                    <button className="text-sm font-medium text-red-600 hover:text-red-700">Remove</button>
                  </div>
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2">
                    + Add Payment Method
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Payouts</h2>
                  <p className="text-sm text-gray-500 mt-1">Where your earnings and milestone payments are sent.</p>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                        <Landmark className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Bank Account (PKR)</div>
                        <div className="text-xs text-gray-500">Faysal Bank ending in ****8921</div>
                      </div>
                    </div>
                    <button className="text-sm font-medium text-red-600 hover:text-red-700">Remove</button>
                  </div>
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2">
                    + Add Payout Method
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
                  <p className="text-sm text-gray-500 mt-1">Audit trail of escrows, payouts, and purchases.</p>
                </div>
                <div className="p-0">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Oct 24, 2026</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Escrow Hold (Order #1024)</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">$1,200.00</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">In Escrow</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Oct 20, 2026</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Credit Purchase (20 AI Credits)</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">$10.00</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Paid</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-gray-600" /> Personal Profile
                </h2>
                <p className="text-sm text-gray-500 mt-1">Update your name and unique sharing handle.</p>
              </div>
              
              <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
                {saveStatus && (
                  <div className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${
                    saveStatus.type === 'success' 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    <span>{saveStatus.message}</span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullNameInput}
                    onChange={(e) => setFullNameInput(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm focus:outline-none"
                    placeholder="e.g. Muhammad Faiq Ali"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="username" className="block text-sm font-semibold text-gray-700">Username / Sharing Handle</label>
                  <div className="flex rounded-lg shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      {baseUrl}/
                    </span>
                    <input
                      id="username"
                      type="text"
                      required
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                      className="flex-1 block w-full min-w-0 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm focus:outline-none"
                      placeholder="username"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Your shared orders will appear as: <span className="font-semibold text-indigo-600">{baseUrl}/{usernameInput || 'username'}/orderID</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                    <input
                      type="text"
                      disabled
                      value={userEmail}
                      className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-400 rounded-lg text-sm cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Account Role</label>
                    <input
                      type="text"
                      disabled
                      value={user?.role ? user.role.toUpperCase() : 'USER'}
                      className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-400 rounded-lg text-sm cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
