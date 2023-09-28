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

}

window.addEventListener('load', () => {
  new Main();
});

var selected_device = null;

async function conectarAutomaticamente() {
  try {
    // Especifica la dirección MAC u otro identificador único del dispositivo previamente conectado
    const dispositivoPreviamenteConectado = await navigator.bluetooth.requestDevice({
      filters: [{ deviceId: { exact: 'DirecciónMAC' } }], // Cambia 'DirecciónMAC' por el identificador real
      optionalServices: ['battery_service'], // Servicios opcionales a los que te conectarás
    });

    // Conecta automáticamente al dispositivo previamente conectado
    await dispositivoPreviamenteConectado.gatt.connect();

    // Asigna el dispositivo previamente conectado a selected_device
    selected_device = dispositivoPreviamenteConectado;
    console.log("Conexión exitosa con el dispositivo previamente conectado:", selected_device.name);
  } catch (error) {
    console.error("Error al conectar con el dispositivo previamente conectado:", error);
  }
}

//Impresora Zebra
function imprimir() {
  // Obtener el valor seleccionado en el elemento select
  var selectedPrinter = document.getElementById("printerSelect").value;
  // Realizar acciones según la opción seleccionada
  if (selectedPrinter === "Zebra") {
    if (!selected_device) {
      alert("No se ha establecido una conexión con una impresora Zebra.");
      return;
    }

    // Realizar la impresión utilizando la conexión Bluetooth previamente establecida
    if (this.fileInput.value === '') {
      console.log('Ningún archivo seleccionado');
      return;
    }

    const selectedFile = this.fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
      const binaryString = event.target.result;
      const pdfText = window.btoa(binaryString);

      // Enviar los comandos ZPL con el contenido del PDF a la impresora Zebra
      var comandosZPL = "^XA^FO200,200^A0N36,36^FD" + pdfText + "^FS^XZ";
      selected_device.send(comandosZPL, undefined, errorCallback);

      console.log("Imprimiendo en una impresora Zebra...");
    };
    reader.readAsBinaryString(selectedFile);
  } else if (selectedPrinter === "Star") {
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
      console.log("Imprimiendo en una impresora Star...");
  } else {
      alert("Selecciona una impresora válida (Zebra o Star).");
  }
}

conectarAutomaticamente();