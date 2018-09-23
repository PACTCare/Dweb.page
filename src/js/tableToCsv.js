function downloadCSV(csv, filename) {
  var csvFile;
  var downloadLink;
  csvFile = new Blob([csv], { type: "text/csv" });
  downloadLink = document.createElement("a");
  downloadLink.download = filename;
  downloadLink.href = window.URL.createObjectURL(csvFile);
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, "g"), replace);
}

window.exportTableToCSV = function(filename) {
  var csv = [];
  var rows = document.querySelectorAll("table tr");

  for (var i = 0; i < rows.length; i++) {
    var row = [],
      cols = rows[i].querySelectorAll("td, th");

    for (var j = 0; j < cols.length; j++) row.push(cols[j].innerText);

    csv.push(row.join(","));
  }

  downloadCSV(csv.join("\n"), filename);
};
