function downloadCSV(csv, filename) {
  const csvFile = new Blob([csv], { type: 'text/csv' });
  const downloadLink = document.createElement('a');
  downloadLink.download = filename;
  downloadLink.href = window.URL.createObjectURL(csvFile);
  downloadLink.style.display = 'none';
  document.body.appendChild(downloadLink);
  downloadLink.click();
}

window.exportTableToCSV = function (filename) {
  const csv = [];
  const rows = document.querySelectorAll('table tr');

  // Number of rows
  for (let i = 0; i < rows.length; i++) {
    const row = [];


    const cols = rows[i].querySelectorAll('td, th');

    for (let j = 0; j < cols.length; j++) {
      row.push(cols[j].innerText.replace('\n', ''));
    }

    csv.push(row.join(','));
  }

  downloadCSV(csv.join('\n'), filename);
};
