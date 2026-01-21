import React from 'react';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Bell, 
  Shield,
  Database,
  Trash2,
  Info,
  CheckCircle,
  ExternalLink,
  Cpu,
  Lock
} from 'lucide-react';
import { Card, CardHeader } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useAnalysisStore } from '@/store/analysisStore';
import { useDocumentStore } from '@/store/documentStore';
import { FRAMEWORKS } from '@/config/accreditationFrameworks';

const Settings: React.FC = () => {
  const { currentFramework, setCurrentFramework } = useAnalysisStore();
  const documentStore = useDocumentStore();
  const analysisStore = useAnalysisStore();

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Settings</h1>
          <p className="text-gray-500 mt-1">
            Manage your platform preferences and data storage
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Framework & Data */}
        <div className="lg:col-span-2 space-y-8">
          {/* Framework Selection */}
          <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader
              title="Accreditation Framework"
              subtitle="Select the primary framework for AI analysis"
            />
            <div className="p-6 pt-0 space-y-4">
              {Object.values(FRAMEWORKS).map((framework) => (
                <div
                  key={framework.id}
                  className={`group relative p-5 border transition-all duration-300 rounded-2xl cursor-pointer
                    ${currentFramework === framework.id
                      ? 'border-primary-500 bg-primary-50/50 shadow-sm'
                      : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50/50'}`}
                  onClick={() => setCurrentFramework(framework.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl transition-colors ${currentFramework === framework.id ? 'bg-white text-primary-600 shadow-sm' : 'bg-gray-50 text-gray-400 group-hover:text-primary-500'}`}>
                        <Globe className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{framework.name}</p>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mt-0.5">
                          {framework.standards.length > 0 
                            ? `${framework.standards.length} standards configured`
                            : 'Coming soon'}
                        </p>
                      </div>
                    </div>
                    {currentFramework === framework.id && (
                      <CheckCircle className="w-6 h-6 text-primary-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Data Management */}
          <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader
              title="Data Management"
              subtitle="Overview of your locally stored information"
            />
            <div className="p-6 pt-0 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Documents', count: documentStore.documents.length, icon: Database },
                  { label: 'Analyses', count: analysisStore.analyses.length, icon: Cpu },
                  { label: 'Reports', count: analysisStore.reports.length, icon: Shield }
                ].map((item) => (
                  <div key={item.label} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm text-gray-400">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-black text-gray-900">{item.count}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-rose-50/50 border border-rose-100 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-rose-600">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-rose-900">Danger Zone</h4>
                    <p className="text-sm text-rose-700 mt-1 leading-relaxed">
                      Clearing all data will permanently remove all uploaded documents, analysis results, and generated reports from your local storage.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-100 hover:border-rose-300 font-bold text-xs"
                      onClick={clearAllData}
                    >
                      Reset Platform Data
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: About & Info */}
        <div className="lg:col-span-1 space-y-8">
          {/* About Card */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-gray-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                <SettingsIcon className="w-7 h-7 text-primary-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">DetEdTech AI</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                Empowering dental education providers with intelligent accreditation tools.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Version</span>
                  <span className="text-sm font-mono text-primary-400">1.0.0-stable</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Security</span>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Lock className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">Local Encryption</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  © 2026 DetEdTech Platform. All rights reserved. Designed for GDC accreditation excellence.
                </p>
              </div>
            </div>
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl"></div>
          </Card>

          {/* Quick Links */}
          <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader title="Resources" />
            <div className="p-6 pt-0 space-y-2">
              {[
                { label: 'GDC Standards Documentation', icon: ExternalLink },
                { label: 'Platform User Guide', icon: Info },
                { label: 'Privacy Policy', icon: Shield }
              ].map((link) => (
                <button key={link.label} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors group">
                  <span className="text-sm font-bold text-gray-700 group-hover:text-primary-600 transition-colors">{link.label}</span>
                  <link.icon className="w-4 h-4 text-gray-300 group-hover:text-primary-400" />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
