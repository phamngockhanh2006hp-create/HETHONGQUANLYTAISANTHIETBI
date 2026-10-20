import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Printer, Eye, QrCode as QrIcon } from 'lucide-react';
import { Equipment } from '../types';

interface QRCodeBadgeProps {
  equipment: Equipment;
  onViewDetail?: () => void;
  size?: number;
  showActions?: boolean;
}

export const QRCodeBadge: React.FC<QRCodeBadgeProps> = ({ 
  equipment, 
  onViewDetail, 
  size = 180,
  showActions = true 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>('');

  // The QR payload contains structured JSON for rapid verification and URL
  const qrPayload = JSON.stringify({
    assetId: equipment.id,
    name: equipment.name,
    labRoom: equipment.labRoom,
    manager: equipment.manager,
    status: equipment.status,
    system: "Hệ thống Quản lý Tài sản Thiết bị",
    verifyUrl: `https://labchain.local/asset/${equipment.id}`
  });

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrPayload, {
        width: size,
        margin: 1.5,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      }, (error) => {
        if (error) console.error(error);
        if (canvasRef.current) {
          setDataUrl(canvasRef.current.toDataURL());
        }
      });
    }
  }, [equipment, qrPayload, size]);

  const downloadQR = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QR_${equipment.id}_${equipment.name.replace(/\s+/g, '_')}.png`;
    a.click();
  };

  const printQR = () => {
    const printWindow = window.open('', '_blank', 'width=600,height=700');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tem Nhãn Tài Sản - ${equipment.id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; text-align: center; }
            .label-card { border: 2px solid #0f172a; border-radius: 12px; padding: 20px; max-width: 360px; margin: 0 auto; }
            .header { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #475569; margin-bottom: 6px; }
            .asset-id { font-size: 24px; font-weight: bold; color: #0f172a; margin-bottom: 4px; }
            .asset-name { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
            .qr-img { width: 180px; height: 180px; margin: 8px 0; }
            .info-row { font-size: 13px; color: #334155; margin: 4px 0; display: flex; justify-content: space-between; border-top: 1px dashed #cbd5e1; padding-top: 4px; }
            .system-footer { font-size: 10px; color: #64748b; margin-top: 14px; }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="header">TEM NHÃN TÀI SẢN PHÒNG THÍ NGHIỆM</div>
            <div class="asset-id">${equipment.id}</div>
            <div class="asset-name">${equipment.name}</div>
            <img class="qr-img" src="${dataUrl}" alt="QR Code" />
            <div class="info-row"><span>Phòng Lab:</span><strong>${equipment.labRoom}</strong></div>
            <div class="info-row"><span>Người quản lý:</span><strong>${equipment.manager}</strong></div>
            <div class="info-row"><span>Model:</span><strong>${equipment.model || 'Tiêu chuẩn'}</strong></div>
            <div class="system-footer">HỆ THỐNG QUẢN LÝ TÀI SẢN THIẾT BỊ · BLOCKCHAIN VERIFIED</div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col items-center p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
      <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-inner">
        <canvas ref={canvasRef} className="rounded-lg" />
      </div>

      <div className="mt-3 text-center">
        <span className="font-mono text-xs font-semibold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
          {equipment.id}
        </span>
        <h4 className="mt-1.5 text-sm font-semibold text-slate-800 line-clamp-1">{equipment.name}</h4>
        <p className="text-xs text-slate-500 mt-0.5">{equipment.labRoom} · {equipment.manager}</p>
      </div>

      {showActions && (
        <div className="mt-4 flex items-center gap-2 w-full pt-3 border-t border-slate-100">
          <button
            onClick={downloadQR}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            title="Tải ảnh QR về máy"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải QR</span>
          </button>
          <button
            onClick={printQR}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            title="In tem dán thiết bị"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In QR</span>
          </button>
          {onViewDetail && (
            <button
              onClick={onViewDetail}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors"
              title="Xem chi tiết thiết bị"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem chi tiết</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
