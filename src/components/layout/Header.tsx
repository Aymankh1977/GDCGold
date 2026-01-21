import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Bell, 
  Settings, 
  User,
  Search,
  Command
} from 'lucide-react';
import { APP_NAME } from '@/utils/constants';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="px-8 py-3 flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-primary-600 p-2 rounded-xl shadow-lg shadow-primary-100 group-hover:scale-105 transition-transform duration-200">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 leading-none">
              {APP_NAME}
            </h1>
            <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-1">
              AI Accreditation
            </span>
          </div>
        </Link>

        {/* Search Bar - Redesigned */}
        <div className="flex-1 max-w-2xl mx-12">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full pl-11 pr-16 py-2.5 bg-gray-50 border border-transparent rounded-2xl text-sm
                         focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/20 transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-1 bg-white border border-gray-200 rounded-md shadow-sm pointer-events-none">
              <Command className="w-3 h-3 text-gray-400" />
              <span className="text-[10px] font-bold text-gray-400">K</span>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-3">
          <button className="relative p-2.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
          
          <div className="h-6 w-px bg-gray-100 mx-1"></div>

          <Link 
            to="/settings"
            className="p-2.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
          >
            <Settings className="w-5 h-5" />
          </Link>

          <button className="flex items-center gap-3 pl-2 pr-1 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-2xl transition-all group">
            <div className="flex flex-col items-end mr-1">
              <span className="text-xs font-bold text-gray-900">Dr. Sarah Smith</span>
              <span className="text-[10px] text-gray-500">Administrator</span>
            </div>
            <div className="w-9 h-9 bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-100 group-hover:border-primary-200 transition-colors">
              <User className="w-5 h-5 text-primary-600" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
