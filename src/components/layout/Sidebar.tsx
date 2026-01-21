import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  ClipboardList,
  FileOutput,
  Settings,
  HelpCircle,
  ChevronRight,
  Globe
} from 'lucide-react';
import { classNames } from '@/utils/helpers';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Documents', path: '/documents', icon: FileText },
  { name: 'Analysis', path: '/analysis', icon: BarChart3 },
  { name: 'Questionnaire', path: '/questionnaire', icon: ClipboardList },
  { name: 'Reports', path: '/reports', icon: FileOutput },
];

const bottomNavItems: NavItem[] = [
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'Help', path: '/help', icon: HelpCircle },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const NavLinkItem: React.FC<{ item: NavItem }> = ({ item }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    return (
      <NavLink
        to={item.path}
        className={classNames(
          'group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ease-in-out',
          isActive
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
        )}
      >
        <Icon className={classNames(
          'w-5 h-5 transition-colors duration-200',
          isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
        )} />
        <span className="flex-1 text-sm font-medium">{item.name}</span>
        {item.badge && (
          <span className={classNames(
            'px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider',
            isActive ? 'bg-white/20 text-white' : 'bg-primary-50 text-primary-700'
          )}>
            {item.badge}
          </span>
        )}
        {isActive && <ChevronRight className="w-4 h-4 text-white/70" />}
      </NavLink>
    );
  };

  return (
    <aside className="w-72 bg-white border-r border-gray-100 min-h-screen flex flex-col shadow-sm">
      <div className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
        {/* Main Navigation */}
        <div>
          <h3 className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-4">
            Main Menu
          </h3>
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <NavLinkItem key={item.path} item={item} />
            ))}
          </nav>
        </div>

        {/* Support Section */}
        <div>
          <h3 className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-4">
            Support
          </h3>
          <nav className="space-y-1.5">
            {bottomNavItems.map((item) => (
              <NavLinkItem key={item.path} item={item} />
            ))}
          </nav>
        </div>
      </div>

      {/* Framework Selector - Redesigned */}
      <div className="p-4 mt-auto">
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-white rounded-lg shadow-sm">
              <Globe className="w-4 h-4 text-primary-600" />
            </div>
            <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">
              Active Framework
            </span>
          </div>
          <div className="relative">
            <select className="w-full appearance-none bg-white px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700
                              focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer">
              <option value="GDC">GDC (UK)</option>
              <option value="NCAAA">NCAAA (Saudi Arabia)</option>
              <option value="ADA">ADA (USA)</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
