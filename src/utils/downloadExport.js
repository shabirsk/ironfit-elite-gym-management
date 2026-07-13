import api from '../api/axios';

const EXPORT_META = {
  revenue: {
    pdf: { filename: (y) => `revenue-${y}.pdf` },
    excel: { filename: (y) => `revenue-${y}.xlsx` },
    csv: { filename: (y) => `revenue-${y}.csv` },
  },
  attendance: {
    pdf: { filename: (m, y) => `attendance-${m}-${y}.pdf` },
    excel: { filename: (m, y) => `attendance-${m}-${y}.xlsx` },
    csv: { filename: (m, y) => `attendance-${m}-${y}.csv` },
  },
  members: {
    pdf: { filename: () => 'members-report.pdf' },
    excel: { filename: () => 'members-report.xlsx' },
    csv: { filename: () => 'members-report.csv' },
  },
};

export const downloadExport = async (reportType, format, params = {}) => {
  const meta = EXPORT_META[reportType]?.[format];
  if (!meta) throw new Error(`Unknown export: ${reportType}/${format}`);

  const token = localStorage.getItem('token');
  const queryParts = [];
  if (params.year) queryParts.push(`year=${params.year}`);
  if (params.month) queryParts.push(`month=${params.month}`);
  if (params.status) queryParts.push(`status=${params.status}`);
  const query = queryParts.length > 0 ? '?' + queryParts.join('&') : '';

  const url = api.defaults.baseURL + `/exports/${reportType}/${format}${query}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(errText || `Export failed (${response.status})`);
  }

  const blob = await response.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);

  let filename;
  if (reportType === 'revenue') filename = meta.filename(params.year || new Date().getFullYear());
  else if (reportType === 'attendance') {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const m = months[(params.month || new Date().getMonth()) - 1] || 'Jan';
    filename = meta.filename(m, params.year || new Date().getFullYear());
  } else filename = meta.filename();

  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
};
