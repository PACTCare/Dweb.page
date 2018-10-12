import { saveAs } from './fileSaver';

function downloadCSV(csv, fileName) {
  const csvFile = new Blob([csv], { type: 'text/csv' });
  saveAs(csvFile, fileName);
}

window.exportTableToCSV = function exportTableToCSV(filename) {
  const csv = [];
  const rows = document.querySelectorAll('table tr');
  // Number of rows
  for (let i = 0; i < rows.length; i += 1) {
    const row = [];
    const cols = rows[i].querySelectorAll('td, th');
    for (let j = 0; j < cols.length; j += 1) {
      row.push(cols[j].innerText.replace('\n', ''));
    }

    csv.push(row.join(','));
  }

  downloadCSV(csv.join('\n'), filename);
};
