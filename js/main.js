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
    navigator.serviceWorker.register('./sw.js?version=2.28')
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
var fileInput;
var selected_device;
var devices = [];
var storedDevices;

let nIntervId;
var statusTexts = ["Buscando dispositivos", "Buscando dispositivos.", "Buscando dispositivos..", "Buscando dispositivos..."];
var contenedor = document.getElementById("contenedor");
var nuevoParrafo;

//Mostrar texto de carga de conexión con impresoras
function flashText() {
  var currentText = nuevoParrafo.textContent;
  var currentIndex = statusTexts.indexOf(currentText);
  if (currentIndex === -1 || currentIndex === statusTexts.length - 1) {
    currentIndex = -1; // Reiniciar al primer elemento
  }
  nuevoParrafo.textContent = statusTexts[currentIndex + 1];
}

//Conexión de la PWA con las impresoras
function setupZebra(){
  nuevoParrafo = document.createElement("p");
  nuevoParrafo.textContent = "Buscando dispositivos";
  document.body.appendChild(nuevoParrafo);
  nIntervId = setInterval(flashText, 1000);
  fileInput = document.getElementById('fileInput');
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


async function writeToSelectedPrinter()
{ 
  //var zpl=await pdfToZpl(fileBackup)
	//selected_device.send("^XA^FO50,50^A0N,36,36^FDHello, ZPL^FS^XZ", undefined, errorCallback);
  var zpl=await pdfToZpl(fileBackup);
  const zplArchive = new Blob([zpl], { type: 'text/plain' });
  selected_device.sendFile(zplArchive, undefined, errorCallback);
}

/*********************************************** */
window.addEventListener('load', () => {
  registerServiceWorker()
  setupZebra()
});

function imprimir() {
  // Obtener el valor seleccionado en el elemento select
  var selectedPrinter = document.getElementById("printerSelect").value;
  // Realizar acciones según la opción seleccionada
  if (selectedPrinter === "Zebra") {

  }else {
      alert("Selecciona una impresora válida (Zebra o Star).");
  }
}

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
                  ${390-initialPosition},
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
    return content
}

// Agrega un event listener al input file para el evento 'change'
fileInput.addEventListener('change', async function() {
  var file = fileInput.files[0]; // Obtener el archivo seleccionado

  if (file) {
    displayPdf(file);
    //var zpl = await pdfToZpl(file);
    //selected_device.send(zpl, undefined, errorCallback);
  } else {
    console.error('Ningún archivo seleccionado');
  }
});

// async function inputFileToZpl() {
//   var fileInput = document.getElementById('fileInput');
//   var file = fileInput.files[0]; // Obtener el archivo seleccionado

//   if (file) {
//     var zpl=await pdfToZpl(file)
//     selected_device.send(zpl, undefined, errorCallback);
  
//   } else {
//     console.error('Ningún archivo seleccionado');
//   }
// }

function displayPdf(file) {
  // Verificar si el archivo es de tipo PDF
  if (file.type === 'application/pdf') {
    fileBackup=file
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
  // var inputArchivo = document.getElementById('fileInput');
  // inputArchivo.files[0]=file;
  // inputArchivo.textContent=file.name;
  displayFile(file);
});

//FUNCIONES PARA IMPRESORA STAR

var changeHref;
var pdfStarToPrint;

function response() {
    createURL();
    getParameter();
}

function getParameter() {
    document.getElementById("res").value = location.search.substring(1);
}

function createURL() {
    changeHref = 'starpassprnt://v1/print/nopreview?';

    // pdf
    changeHref = changeHref + "&pdf=" + encodeURIComponent(pdfText);

    document.getElementById("send_data").value = changeHref;
}

function setUrl() {
    switch (document.getElementById("url").value) {
        case "none":
            document.getElementById("url_free").value = "";
            break;
        case "pdf_receipt_sample":
            document.getElementById("url_free").value = "https://www.star-m.jp/products/s_print/sdk/passprnt/sample/resource/receipt_sample.pdf";
            break;
        default:
            break;
    }

    createURL();
}