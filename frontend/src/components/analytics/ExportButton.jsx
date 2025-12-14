/**
 * ExportButton Component
 * Botón para exportar dashboard en diferentes formatos
 */

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileType } from 'lucide-react';
import toast from 'react-hot-toast';
import analyticsService from '../../services/analyticsService';

const ExportButton = ({ filters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);

  const exportOptions = [
    {
      format: 'PDF',
      label: 'Exportar como PDF',
      icon: FileText,
      description: 'Documento portable',
    },
    {
      format: 'EXCEL',
      label: 'Exportar como Excel',
      icon: FileSpreadsheet,
      description: 'Hoja de cálculo',
    },
    {
      format: 'CSV',
      label: 'Exportar como CSV',
      icon: FileType,
      description: 'Valores separados por comas',
    },
  ];

  const handleExport = async (format) => {
    try {
      setIsExporting(true);
      setExportFormat(format);
      setIsOpen(false);

      console.log(`📊 Exporting dashboard as ${format}`);

      // 1. Generar reporte
      const response = await analyticsService.generateReport({
        reportType: 'dashboard',
        format,
        startDate: filters.dateFrom,
        endDate: filters.dateTo,
        includeCharts: true,
      });

      console.log('✅ Report generated:', response);

      if (!response?.report?.fileName) {
        throw new Error('No se recibió el nombre del archivo del servidor');
      }

      // 2. Descargar archivo con autenticación
      const token = localStorage.getItem('accessToken');
      const downloadUrl = `http://localhost:3000/api/analytics/reports/${response.report.fileName}/download`;

      console.log('📥 Downloading from:', downloadUrl);

      const downloadResponse = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!downloadResponse.ok) {
        throw new Error(`Error al descargar: ${downloadResponse.status}`);
      }

      // 3. Convertir a Blob y descargar
      const blob = await downloadResponse.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = response.report.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpiar blob URL
      window.URL.revokeObjectURL(blobUrl);

      toast.success(`Reporte ${format} descargado exitosamente`, {
        icon: format === 'PDF' ? '📄' : format === 'EXCEL' ? '📊' : '📋',
      });
    } catch (error) {
      console.error('❌ Error exporting:', error);
      toast.error(`Error al generar reporte: ${error.message}`);
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  return (
    <div className="relative">
      {/* Botón principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all ${
          isExporting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
        }`}
      >
        <Download size={18} className={isExporting ? 'animate-bounce' : ''} />
        {isExporting ? `Generando ${exportFormat}...` : 'Exportar'}
      </button>

      {/* Menú desplegable */}
      {isOpen && !isExporting && (
        <>
          {/* Overlay para cerrar al hacer clic fuera */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Opciones de exportación */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
            {exportOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.format}
                  onClick={() => handleExport(option.format)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                >
                  <Icon className="text-indigo-600 mt-0.5 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {option.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;
