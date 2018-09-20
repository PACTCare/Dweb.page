const fileSizeLimit = 1000; // In MB

function supportsCrypto() {
  return window.crypto && crypto.subtle;
}

function supportsFileread() {
  return window.File && window.FileList && window.FileReader;
}

const checkbox = document.getElementById("endToEndCheck");

checkbox.addEventListener("change", function() {
  if (this.checked) {
    document.getElementById("checkboxText").innerText = "On";
    document.getElementById("checkboxText").style.color = "#3157a7";
  } else {
    document.getElementById("checkboxText").innerText = "Off";
    document.getElementById("checkboxText").style.color = "#6f6f6f";
  }
});

function ekUpload() {
  function Init() {
    var fileSelect = document.getElementById("file-upload"),
      fileDrag = document.getElementById("file-drag");

    fileSelect.addEventListener("change", fileSelectHandler, false);

    // Is XHR2 available?
    var xhr = new XMLHttpRequest();
    if (xhr.upload) {
      // File Drop
      fileDrag.addEventListener("dragover", fileDragHover, false);
      fileDrag.addEventListener("dragleave", fileDragHover, false);
      fileDrag.addEventListener("drop", fileSelectHandler, false);
    }
  }

  function fileDragHover(e) {
    var fileDrag = document.getElementById("file-drag");
    e.stopPropagation();
    e.preventDefault();
    fileDrag.className =
      e.type === "dragover" ? "hover" : "modal-body file-upload";
  }

  function fileSelectHandler(e) {
    // Fetch FileList object
    var files = e.target.files || e.dataTransfer.files;
    fileDragHover(e);

    // Process all File objects
    for (var i = 0, f; (f = files[i]); i++) {
      parseFile(f);
    }
  }

  function output(msg) {
    var m = document.getElementById("messages");
    m.innerHTML = msg;
  }

  function parseFile(file) {
    output("<strong>" + encodeURI(file.name) + "</strong>");

    document.getElementById("start").classList.add("hidden");
    document.getElementById("response").classList.remove("hidden");
    // Thumbnail Preview
    const imageName = file.name;
    const isImage = /\.(?=gif|jpg|png|jpeg)/gi.test(imageName);
    if (isImage) {
      document.getElementById("file-image").classList.remove("hidden");
      document.getElementById("file-image").src = URL.createObjectURL(file);
    }
    if (file.size > fileSizeLimit * 1024 * 1024) {
      output("Please upload a smaller file (< " + fileSizeLimit + " MB).");
      document.getElementById("loadingAnimation").style.display = "none";
    }
  }

  if (supportsCrypto() && supportsFileread()) {
    Init();
  } else {
    document.getElementById("file-drag").style.display = "none";
    document
      .getElementById("notSupported")
      .setAttribute("style", "display:block !important");
  }
}
ekUpload();
