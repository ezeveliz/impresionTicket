class Main {
  constructor() {
    // Obtener el elemento de entrada de archivo
    this.fileInput = document.getElementById('fileInput');

    this.registerServiceWorker();

    this.getPdfOtherApp();
    
    // Registrar el evento 'change' para manejar la carga del archivo compartido
    this.fileInput.addEventListener('change', (event) => {
      this.getPdf();
    });
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registrado con éxito:', registration);
        })
        .catch(error => {
          console.error('Error al registrar el Service Worker:', error);
        });
      });
    }
  }

  getPdfOtherApp(){
    fileInput.addEventListener('change', (event) => {
      const sharedFiles = event.target.files;
      if (sharedFiles.length > 0) {
        const sharedFile = sharedFiles[0]; // Obtener el primer archivo compartido
        // Haz algo con el archivo compartido, por ejemplo, muestra su nombre en la consola
        console.log('Archivo compartido:', sharedFile.name);
      }
    });
  }

  getPdf() {
    if (this.fileInput.value === '') {
      console.log('Ningún archivo seleccionado');
      return;
    }

    const selectedFile = this.fileInput.files[0];

    const reader = new FileReader();

    reader.onload = function(event) {
      const binaryString = event.target.result;
      const pdfText = window.btoa(binaryString);

      // Haz lo que necesites con pdfText, por ejemplo, mostrarlo en la consola
      console.log('Contenido del PDF en base64:', pdfText);
    };

    reader.readAsBinaryString(selectedFile);
  }

  /*function getPdf(callback) {
    if (document.getElementById("pdf").value === 'none') {
        pdfText = "";
    }
    else {
      var file = "resource\/" + document.getElementById("pdf").value + "\.pdf";

      var pdfFile = new XMLHttpRequest();
      pdfFile.callback = callback;
      pdfFile.open("GET", file, true);
      pdfFile.responseType = "arraybuffer";
      pdfFile.onload = function () {
        var binary = new Uint8Array(this.response);
        var binaryString = "";
        for (var i=0; i<binary.byteLength; i++) {
          binaryString += String.fromCharCode(binary[i]);
        }

        // base64 encoding
        pdfText = window.btoa(binaryString);

        this.callback.apply(this, this.argument);
      }
      pdfFile.send(null);
    }

    createURL();
  }*/

}

window.addEventListener('load', () => {
  new Main();
});
