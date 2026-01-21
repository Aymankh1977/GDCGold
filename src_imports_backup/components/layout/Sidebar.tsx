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
  ChevronRight
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
          'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
          isActive
            ? 'bg-primary-50 text-primary-700 font-medium'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        )}
      >
        <Icon className={classNames('w-5 h-5', isActive && 'text-primary-600')} />
        <span className="flex-1">{item.name}</span>
        {item.badge && (
          <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
            {item.badge}
          </span>
        )}
        {isActive && <ChevronRight className="w-4 h-4 text-primary-400" />}
      </NavLink>
    );
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLinkItem key={item.path} item={item} />
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-1">
        {bottomNavItems.map((item) => (
          <NavLinkItem key={item.path} item={item} />
        ))}
      </div>

      {/* Framework Selector */}
      <div className="p-4 border-t border-gray-200">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Framework
        </label>
        <select className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                          focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="GDC">GDC (UK)</option>
          <option value="NCAAA">NCAAA (Saudi Arabia)</option>
          <option value="ADA">ADA (USA)</option>
        </select>
      </div>
    </aside>
  );
};