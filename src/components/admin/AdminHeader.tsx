/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User } from '../../types';
import { getRoleLabel } from '../../lib/utils';
import {
  RefreshCw,
  Bell,
  Menu
} from 'lucide-react';

interface AdminHeaderProps {
  currentUser: User | null;
  onRefreshData: () => void;
  onToggleMobileSidebar?: () => void;
  activeMenuTitle?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentUser,
  onRefreshData,
  onToggleMobileSidebar,
  activeMenuTitle
}) => {
  return (
    <header className="h-16 bg-white border-b border-stone-200 px-3 sm:px-6 flex items-center justify-between shrink-0 z-10 gap-2">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 min-w-[40px] min-h-[40px] flex items-center justify-center text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors shrink-0"
            aria-label="Buka Menu Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-xs sm:text-base font-bold text-stone-900 truncate">
          {activeMenuTitle || 'Dashboard'}
        </h1>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Refresh button */}
        <button
          onClick={onRefreshData}
          title="Sinkronkan & Muat Ulang Data"
          className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* User Card */}
        <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-stone-200">
          <div className="w-8 h-8 rounded-full bg-[#123B35] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
            {currentUser?.name?.charAt(0) || 'A'}
          </div>
          <div className="hidden sm:block text-left max-w-[120px] truncate">
            <p className="text-xs font-bold text-stone-900 leading-tight truncate">
              {currentUser?.name || 'Administrator'}
            </p>
            <p className="text-[10px] text-stone-500 font-medium truncate">
              {getRoleLabel(currentUser?.role || 'super_admin')}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
