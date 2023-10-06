//pdfjsLib.GlobalWorkerOptions.workerSrc ='https://mozilla.github.io/pdf.js/build/pdf.worker.js';
//pdfjsLib.GlobalWorkerOptions.workerSrc ='https://github.com/mozilla/pdfjs-dist';
//import pdfJsLib from "https://example.com/nombreDeLaLibreria.js";
// Loaded via <script> tag, create shortcut to access PDF.js exports.
var pdfjsLib = window['pdfjs-dist/build/pdf'];
// The workerSrc property shall be specified.

/**
 * If you need the last version of pdf.worker.js you can get it from:
 * pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';
 * 
 */
pdfjsLib.GlobalWorkerOptions.workerSrc = './lib/pdfWorker.js';

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?version=31')
    .then(registration => {
      //alert('Service Worker registrado con éxito:', registration);
      console.log('Service Worker registrado con éxito:', registration);
    })
    .catch(error => {
      //alert('Error al registrar el Service Worker:', error);
      console.error('Error al registrar el Service Worker:', error);
    });
  }
}

/**************ZEBRA ******************/
var selected_device;
var devices = [];
var storedDevices;

let nIntervId;
var statusTexts = ["Buscando dispositivos", "Buscando dispositivos.", "Buscando dispositivos..", "Buscando dispositivos..."];
var contenedor = document.getElementById("contenedor");
var nuevoParrafo;

function flashText() {
  var currentText = nuevoParrafo.textContent;
  var currentIndex = statusTexts.indexOf(currentText);
  if (currentIndex === -1 || currentIndex === statusTexts.length - 1) {
    currentIndex = -1; // Reiniciar al primer elemento
  }
  nuevoParrafo.textContent = statusTexts[currentIndex + 1];
}

function setupZebra(){
  nuevoParrafo = document.createElement("p");
  nuevoParrafo.textContent = "Buscando dispositivos";
  document.body.appendChild(nuevoParrafo);
  nIntervId = setInterval(flashText, 1000);
  //Get the default device from the application as a first step. Discovery takes longer to complete.
  BrowserPrint.getDefaultDevice("printer", function(device){
    //Add device to list of devices and to html select element
    selected_device = device;
    devices.push(device);
    var html_select = document.getElementById("selected_device");
    var option = document.createElement("option");
    option.text = device.name;
    html_select.add(option);
    //Discover any other devices available to the application
    BrowserPrint.getLocalDevices(function(device_list){
      for(var i = 0; i < device_list.length; i++){
        //Add device to list of devices and to html select element
        var device = device_list[i];
        if(!selected_device || device.uid != selected_device.uid){
          devices.push(device);
          var option = document.createElement("option");
          option.text = device.name;
          option.value = device.uid;
          html_select.add(option);
        }
      }
      localStorage.setItem('devices', JSON.stringify(devices));
      clearInterval(nIntervId);
      nIntervId = null;
      nuevoParrafo.textContent = "Dispositivos encontrados"
    }, function(){
      alert("Error getting local devices")
      clearInterval(nIntervId);
      nIntervId = null;
      nuevoParrafo.textContent = "Error al buscar dispositivos"
    },"printer");
  }, function(error){
    alert(error);
  })
}

function onDeviceSelected(selected){
	for(var i = 0; i < devices.length; ++i){
		if(selected.value == devices[i].uid){
			selected_device = devices[i];
			return;
		}
	}
}

var errorCallback = function(errorMessage){
	alert("Error: " + errorMessage);	
}

function sendFile(fileUrl){
  url = window.location.href.substring(0, window.location.href.lastIndexOf("/"));
  url = url + "/" + fileUrl;
  selected_device.sendFile(url, undefined, errorCallback)
}


function writeToSelectedPrinter()
{ 
  var zpl=pdfToZpl(fileBackup)
	selected_device.send(zpl, undefined, errorCallback);
}

/*********************************************** */
window.addEventListener('load', () => {
  registerServiceWorker()
  setupZebra()
});

/*async function conectarAutomaticamente() {
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
    alert("Conexión exitosa con el dispositivo previamente conectado:", selected_device.name);
    console.log("Conexión exitosa con el dispositivo previamente conectado:", selected_device.name);
  } catch (error) {
    alert("Error al conectar con el dispositivo previamente conectado:", error);
    console.error("Error al conectar con el dispositivo previamente conectado:", error);
  }
}*/

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
      alert('Ningún archivo seleccionado');
      console.log('Ningún archivo seleccionado');
      return;
    }
    fileInput = document.getElementById('fileInput');
    const selectedFile = fileInput.files[0];
    sendFile(selectedFile);
/*    const reader = new FileReader();

    reader.onload = function(event) {
      const binaryString = event.target.result;
      const pdfText = window.btoa(binaryString);

      // Enviar los comandos ZPL con el contenido del PDF a la impresora Zebra
      var comandosZPL = "^XA^FO200,200^A0N36,36^FD" + pdfText + "^FS^XZ";
      selected_device.send(comandosZPL, undefined, errorCallback);

      alert("Imprimiendo en una impresora Zebra...");
      console.log("Imprimiendo en una impresora Zebra...");
    };
    reader.readAsBinaryString(selectedFile);*/
  }else {
      alert("Selecciona una impresora válida (Zebra o Star).");
  }
}
//Impresora Zebra
/*function imprimir() {
  conectarAutomaticamente();
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
      alert('Ningún archivo seleccionado');
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

      alert("Imprimiendo en una impresora Zebra...");
      console.log("Imprimiendo en una impresora Zebra...");
    };
    reader.readAsBinaryString(selectedFile);
  } else if (selectedPrinter === "Star") {
      if (this.fileInput.value === '') {
        alert('Ningún archivo seleccionado');
        console.log('Ningún archivo seleccionado');
        return;
      }
      const selectedFile = this.fileInput.files[0];
      const reader = new FileReader();
      reader.onload = function(event) {
        const binaryString = event.target.result;
        const pdfText = window.btoa(binaryString);
        // Haz lo que necesites con pdfText, por ejemplo, mostrarlo en la consola
        alert('Contenido del PDF en base64:', pdfText);
        console.log('Contenido del PDF en base64:', pdfText);
      };
      reader.readAsBinaryString(selectedFile);
      alert("Imprimiendo en una impresora Star...");
      console.log("Imprimiendo en una impresora Star...");
  } else {
      alert("Selecciona una impresora válida (Zebra o Star).");
  }
}*/

//conectarAutomaticamente();


/*** TEST IMG */


var fileBackup;

async function pdfToZpl(file) {
    alert("Procederá a la conversión del PDF a ZPL");
    const pdfUrl = URL.createObjectURL(file);
    // Obtener el PDF y crear una instancia de pdfJsLib
    const loadPdf = await pdfjsLib.getDocument(pdfUrl);
    // Deserializar el PDF
    const PDFContent = await loadPdf.promise;
    // Obtener la página
    const pageNumber = 1; // Cambia el número de página según tus necesidades
    const page = await PDFContent.getPage(pageNumber);
    // Obtener el contenido de texto
    const pdf = await page.getTextContent();
    // Verify exists itens on PDF
    if (!pdf.items || pdf.items.length==0) {
      alert("Saliendo de conversión");
      return;
    }
    // get scale of print
    const scale = pdf.items.map(item => {
      const [, , , , , topPosition] = item.transform;
      return topPosition;
    }).reduce((transform, nextTransform) => 
      Math.min(transform, nextTransform)
    );
    //${425-(initialPosition<125?initialPosition+18:initialPosition)},
    // create content for print.
    let content = '^XA~TA000~JSN^LT0^MNW^MTT^PON^PMN^LH0,0^JMA^PR5,5~SD15^JUS^LRN^CI0^XZ^XA^MMT^PW406^LL0480^LS0^XA';
    // loop data for add itens into content;
    pdf.items.forEach(item => {
      const [fontSize, , , fontWeight, initialPosition, topPosition] = item.transform;
      content += `^FT
                  ${410-initialPosition},
                  ${topPosition - scale}
                  ^A0I,
                  ${fontSize*(1.4)},
                  ${fontWeight}
                  ^FB
                  ${parseInt(item.width)},
                  1,0,C^FH^FD
                  ${(item.str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))}
                  ^FS`;
    })
    // add finish content
    content += '^PQ1,0,1,Y^XZ';
    contenidoZebra=content;
    console.log("****")
    console.log(content)
    const zpl = new Blob([content], { type: 'text/plain' });
    //return zpl
    const a = document.createElement('a');
    a.href = URL.createObjectURL(zpl);
    a.download = 'prueba';
    // Hacer clic en el enlace para descargar el archivo
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function inputFileToZpl(){
  const file = document.querySelector("#fileInput");
  const fileReader = new FileReader();
  fileReader.onload = async () => {
    // Comprobar si el archivo seleccionado es un archivo PDF
    const type = file.files[0].type;
    if (type !== "application/pdf") {
      alert("El archivo seleccionado no es un archivo PDF.");
      return;
    }

    // Convertir el archivo PDF a un objeto PDF.js
    const pdf = await pdfjsLib.getDocument(fileReader.result);

    // Obtener el número de páginas
    const pageCount = pdf.numPages;

    // Crear un arreglo para almacenar el texto de todas las páginas
    const text = [];

    // Iterar sobre todas las páginas
    for (let i = 1; i <= pageCount; i++) {
      // Extraer el texto de la página actual
      const pageText = await pdf.getPage(i).getTextContent();

      // Agregar el texto de la página actual al arreglo
      text.push(pageText);
    }
    console.log(text);
  };
  fileReader.readAsBinaryString(file.files[0]);
}

function displayPdf(file) {
  // Verificar si el archivo es de tipo PDF
  if (file.type === 'application/pdf') {
    fileBackup=file
    //pdfToZpl(pdfUrl);
    // alert("Extrayendo contenido pdf")
    // extractText(pdfUrl).then(
    //   function (text) {
    //               document.write(text)
    //     console.log('parse ' + text);
    //   },
    //   function (reason) {
    //     console.error(reason);
    //   },
    // );
    
  } else {
    alert('El archivo no es de tipo PDF')
    console.error('El archivo no es de tipo PDF');
  }
}

var sharedFile
function displayFile(file) {  
  const ul = document.createElement('ul');
  document.body.append(ul);

  for (const prop of ['name', 'size', 'type']) {
    const li = document.createElement('li');
    li.textContent = `${prop} = ${file[prop]}`;
    ul.append(li);
  }

  // const input = document.getElementById('fileInput');

  // // Crea un objeto FormData para asignar el archivo al input file
  // const formData = new FormData();
  // formData.append(file.name, file, file.name);

  // // Establece el valor del input file con el objeto FormData
  // input.files = formData.getAll(file.name);
  
  displayPdf(file);
}

function extractText(pdfUrl) {
  var pdf = pdfjsLib.getDocument(pdfUrl);
  return pdf.promise.then(function (pdf) {
    var totalPageCount = pdf.numPages;
    var countPromises = [];
    for (
      var currentPage = 1;
      currentPage <= totalPageCount;
      currentPage++
    ) {
      var page = pdf.getPage(currentPage);
      countPromises.push(
        page.then(function (page) {
          var textContent = page.getTextContent();
          return textContent.then(function (text) {
            return text.items
              .map(function (s) {
                return s.str;
              })
              .join('');
          });
        }),
      );
    }

    return Promise.all(countPromises).then(function (texts) {
      return texts.join('');
    });
  });
}



navigator.serviceWorker.addEventListener("message", (event) => {
  alert("On message")
  const file = event.data.file;
  displayFile(file);
});

