import React from 'react';
import { EquipmentStatus } from '../types';

interface StatusBadgeProps {
  status: EquipmentStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'using':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Đang sử dụng
        </span>
      );
    case 'available':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/80 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
          Sẵn sàng
        </span>
      );
    case 'maintenance':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Đang bảo trì
        </span>
      );
    case 'borrowed':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/80 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
          Đang được mượn
        </span>
      );
    case 'stopped':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Ngừng sử dụng
        </span>
      );
  }
};
