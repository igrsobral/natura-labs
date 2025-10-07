import type { TableRow, ProcessedTableData } from '@/shared/types';

/**
 * Export table data to CSV format
 */
export function exportTableToCSV(
  tableData: ProcessedTableData,
  filename: string = 'sales-data.csv'
): void {
  const csvContent = convertTableToCSV(tableData);
  downloadCSV(csvContent, filename);
}

/**
 * Convert table data to CSV string
 */
function convertTableToCSV(tableData: ProcessedTableData): string {
  const rows: string[] = [];
  
  // Add headers
  rows.push(tableData.headers.join(','));
  
  // Add data rows
  tableData.rows.forEach(row => {
    const csvRow = [
      `"${row.brand}"`,
      `"${row.category}"`,
      ...row.values.map(value => value?.toString() || ''),
      row.total?.toString() || ''
    ];
    rows.push(csvRow.join(','));
  });
  
  // Add totals row
  const totalsRow = [
    '"TOTAL"',
    '""',
    ...tableData.totals.byWeek.map(total => total?.toString() || ''),
    tableData.totals.grandTotal?.toString() || ''
  ];
  rows.push(totalsRow.join(','));
  
  return rows.join('\n');
}

/**
 * Download CSV content as file
 */
function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Copy table data to clipboard
 */
export async function copyTableToClipboard(tableData: ProcessedTableData): Promise<boolean> {
  try {
    const csvContent = convertTableToCSV(tableData);
    await navigator.clipboard.writeText(csvContent);
    return true;
  } catch (error) {
    console.error('Failed to copy table data to clipboard:', error);
    return false;
  }
}

/**
 * Search/filter table rows by text
 */
export function searchTableRows(
  rows: TableRow[],
  searchTerm: string
): TableRow[] {
  if (!searchTerm.trim()) {
    return rows;
  }
  
  const term = searchTerm.toLowerCase();
  
  return rows.filter(row => 
    row.brand.toLowerCase().includes(term) ||
    row.category.toLowerCase().includes(term) ||
    row.values.some(value => 
      value?.toString().toLowerCase().includes(term)
    ) ||
    row.total?.toString().toLowerCase().includes(term)
  );
}

/**
 * Highlight search terms in text
 */
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm.trim()) {
    return text;
  }
  
  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Get table row selection utilities
 */
export function createRowSelection() {
  const selectedRows = new Set<string>();
  
  const toggleRow = (rowId: string) => {
    if (selectedRows.has(rowId)) {
      selectedRows.delete(rowId);
    } else {
      selectedRows.add(rowId);
    }
  };
  
  const selectAll = (rowIds: string[]) => {
    rowIds.forEach(id => selectedRows.add(id));
  };
  
  const clearSelection = () => {
    selectedRows.clear();
  };
  
  const isSelected = (rowId: string) => {
    return selectedRows.has(rowId);
  };
  
  const getSelectedCount = () => {
    return selectedRows.size;
  };
  
  const getSelectedRows = () => {
    return Array.from(selectedRows);
  };
  
  return {
    toggleRow,
    selectAll,
    clearSelection,
    isSelected,
    getSelectedCount,
    getSelectedRows
  };
}

/**
 * Calculate table column statistics
 */
export function calculateColumnStats(
  rows: TableRow[],
  columnIndex: number
): {
  min: number | null;
  max: number | null;
  average: number | null;
  sum: number | null;
  count: number;
} {
  const values = rows
    .map(row => row.values[columnIndex])
    .filter((value): value is number => value !== null);
  
  if (values.length === 0) {
    return {
      min: null,
      max: null,
      average: null,
      sum: null,
      count: 0
    };
  }
  
  const sum = values.reduce((acc, val) => acc + val, 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const average = sum / values.length;
  
  return {
    min,
    max,
    average: Math.round(average * 100) / 100,
    sum,
    count: values.length
  };
}

/**
 * Format table data for printing
 */
export function formatTableForPrint(tableData: ProcessedTableData): string {
  let html = '<table border="1" cellpadding="5" cellspacing="0">';
  
  // Headers
  html += '<thead><tr>';
  tableData.headers.forEach(header => {
    html += `<th>${header}</th>`;
  });
  html += '</tr></thead>';
  
  // Body
  html += '<tbody>';
  tableData.rows.forEach(row => {
    html += '<tr>';
    html += `<td>${row.brand}</td>`;
    html += `<td>${row.category}</td>`;
    row.values.forEach(value => {
      html += `<td style="text-align: right">${value?.toLocaleString() || '-'}</td>`;
    });
    html += `<td style="text-align: right; font-weight: bold">${row.total?.toLocaleString() || '-'}</td>`;
    html += '</tr>';
  });
  
  // Totals row
  html += '<tr style="background-color: #f0f0f0; font-weight: bold;">';
  html += '<td>TOTAL</td>';
  html += '<td>-</td>';
  tableData.totals.byWeek.forEach(total => {
    html += `<td style="text-align: right">${total?.toLocaleString() || '-'}</td>`;
  });
  html += `<td style="text-align: right">${tableData.totals.grandTotal?.toLocaleString() || '-'}</td>`;
  html += '</tr>';
  
  html += '</tbody></table>';
  
  return html;
}

/**
 * Print table data
 */
export function printTable(tableData: ProcessedTableData, title: string = 'Sales Data'): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Failed to open print window');
    return;
  }
  
  const tableHtml = formatTableForPrint(tableData);
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
        th { background-color: #f2f2f2; font-weight: bold; }
        @media print {
          body { margin: 0; }
          table { font-size: 12px; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      ${tableHtml}
    </body>
    </html>
  `;
  
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}