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

async function writeToSelectedPrinter()
{ 
  //var zpl=await pdfToZpl(fileBackup)
	//selected_device.send("^XA^FO50,50^A0N,36,36^FDHello, ZPL^FS^XZ", undefined, errorCallback);
  var zpl=await pdfToZpl(fileBackup);
  const zplArchive = new Blob([zpl], { type: 'text/plain' });
  selected_device.sendFile(zplArchive, undefined, errorCallback);
}

/************************************************/
window.addEventListener('load', () => {
  registerServiceWorker()
  setupZebra()
  fileInput = document.getElementById('fileInput');
  inputFileLoad()
  createURL()
});

function imprimir() {
  // Obtener el valor seleccionado en el elemento select
  var selectedPrinter = document.getElementById("printerSelect").value;
  // Realizar acciones según la opción seleccionada
  if (selectedPrinter === "Zebra") {

  }else if(selectedPrinter === "Star"){
  
  }else{
      alert("Selecciona una impresora válida (Zebra o Star).");
  }
}

var fileBackup;

/*FUNCION DE ZEBRA*/

//Convierte el archivo pdf en un zpl para imprimir en las impresoras zebra
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
  // const zpl = new Blob([content], { type: 'text/plain' });
  // //return zpl
  // const a = document.createElement('a');
  // a.href = URL.createObjectURL(zpl);
  // a.download = 'prueba';
  // // Hacer clic en el enlace para descargar el archivo
  // a.style.display = 'none';
  // document.body.appendChild(a);
  // a.click();
  // document.body.removeChild(a);
  return content
}

//El archivo se guarda en una variable global para manejar
function displayPdf(file) {
  // Verificar si el archivo es de tipo PDF
  if (file.type === 'application/pdf') {
    alert("Archivo cargado correctamente");
    fileBackup=file
  } else {
    alert('El archivo no es de tipo PDF, cargue un nuevo')
    console.error('El archivo no es de tipo PDF');
  }
}

//Muetras la información del archivo cargado
function displayFile(file) {  
  const ul = document.createElement('ul');
  document.body.append(ul);
  for (const prop of ['name', 'size', 'type']) {
    const li = document.createElement('li');
    li.textContent = `${prop} = ${file[prop]}`;
    ul.append(li);
  } 
}

// Agrega un event listener al input file para el evento 'change'
function inputFileLoad() {
  fileInput.addEventListener('change', function() {
    var file = fileInput.files[0]; // Obtener el archivo seleccionado
    if (file) {
      displayPdf(file);
      combinePDFPages();
      //getPdf(createURL);
      //load();
    } else {
      console.error('Ningún archivo seleccionado');
    }
  });
}

//Recibe archivos compartidos fuera de la webapp
navigator.serviceWorker.addEventListener("message", (event) => {
  const file = event.data.file;
  var dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  fileInput.files = dataTransfer.files;
  displayPdf(file);
  getPdf(createURL);
  //load();
  //displayFile(file);
});

//FUNCIONES PARA IMPRESORA STAR

var changeHref;

var pdfText  = "";

function createURL() {
	changeHref = 'starpassprnt://v1/print/nopreview?';
  //back
	changeHref = changeHref + "&back=" + encodeURIComponent(window.location.href);
  //size
  changeHref = changeHref + "&size=" + "2w7";
  //pdf
	changeHref = changeHref + "&pdf=" + encodeURIComponent(pdfText);
  document.getElementById("send_data").value = changeHref;
}

async function combineAllPDFPages() {
  //const sourcePdfUrl = 'https://example.com/source.pdf'; // URL del PDF fuente
  //const pdfBytes = await fetch(sourcePdfUrl).then((res) => res.arrayBuffer());

  const pdfDoc = await PDFDocument.create();
  const sourcePdf = await PDFDocument.load(fileBackup);

  const pagesToCombine = Array.from({ length: sourcePdf.getPageCount() }, (_, i) => i);

  const combinedWidth = Math.max(
    ...pagesToCombine.map((pageIndex) => sourcePdf.getPages()[pageIndex].getWidth())
  );

  const combinedHeight = pagesToCombine.reduce(
    (totalHeight, pageIndex) => totalHeight + sourcePdf.getPages()[pageIndex].getHeight(),
    0
  );

  const combinedPage = pdfDoc.addPage([combinedWidth, combinedHeight]);

  let yOffset = combinedHeight;
  for (const pageIndex of pagesToCombine) {
    const page = sourcePdf.getPages()[pageIndex];
    const pageHeight = page.getHeight();
    yOffset -= pageHeight;

    combinedPage.drawPage(page, {
      x: 0,
      y: yOffset,
      width: page.getWidth(),
      height: pageHeight,
    });
  }

  const combinedPdfBytes = await pdfDoc.save();

  // Crea un enlace para la descarga del PDF
  const downloadLink = document.getElementById('downloadLink');
  downloadLink.href = URL.createObjectURL(new Blob([combinedPdfBytes], { type: 'application/pdf' }));
  
  // Activa el enlace para que se inicie la descarga
  downloadLink.style.display = 'block';
  downloadLink.click();
}


//FUNCIONAL//////////////////////////////////////////
// function getPdf(callback) {
//   if (!fileInput.files[0]) {
//     pdfText = "";
//   } else {
//     fileBackup.arrayBuffer().then(resp => {
					
//       let binary = new Uint8Array(resp);
//       var binaryString = "";
//       for (var i=0; i<binary.byteLength; i++) {
//         binaryString += String.fromCharCode(binary[i]);
//       }

//       // base64 encoding
//       pdfText = window.btoa(binaryString);
//       createURL()
//     })
//   }
//   createURL();
// }

function createPrintToStar(){
  //pdfMerge();
  //unifyPdfPages();
  location.href=changeHref;
}

//////////////////////////////////////////////////////////////////////////////

// var urls = [
//   "http://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
//   "http://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
// ];

// // Disable workers to avoid yet another cross-origin issue (workers need
// // the URL of the script to be loaded, and dynamically loading a cross-origin
// // script does not work).
// //
// // pdfjsLib.disableWorker = true;

// // In cases when the pdf.worker.js is located at the different folder than the
// // pdf.js's one, or the pdf.js is executed via eval(), the workerSrc property
// // shall be specified.
// //
// // pdfjsLib.workerSrc = 'pdf.worker.js';

// /**
//  * @typedef {Object} PageInfo
//  * @property {number} documentIndex
//  * @property {number} pageNumber
//  */

// var pdfDocs = [],
//   /**
//    * @property {PageInfo}
//    */
//   current = {},
//   totalPageCount = 0,
//   pageNum = 1,
//   pageRendering = false,
//   pageNumPending = null,
//   scale = 0.8,
//   canvas = document.getElementById("the-canvas"),
//   ctx = canvas.getContext("2d");

// /**
//  * Get page info from document, resize canvas accordingly, and render page.
//  * @param num Page number.
//  */
// function renderPage(num) {
//   pageRendering = true;
//   current = getPageInfo(num);
//   // Using promise to fetch the page
//   fileBackup.getPage(current.pageNumber).then(function(page) {
//     var viewport = page.getViewport({ scale: scale });
//     canvas.height = viewport.height;
//     canvas.width = viewport.width;

//     // Render PDF page into canvas context
//     var renderContext = {
//       canvasContext: ctx,
//       viewport: viewport,
//     };
//     var renderTask = page.render(renderContext);

//     // Wait for rendering to finish
//     renderTask.promise.then(function() {
//       pageRendering = false;
//       if (pageNumPending !== null) {
//         // New page rendering is pending
//         renderPage(pageNumPending);
//         pageNumPending = null;
//       }
//     });
//   });

//   // Update page counters
//   document.getElementById("page_num").textContent = pageNum;
// }

// /**
//  * If another page rendering in progress, waits until the rendering is
//  * finished. Otherwise, executes rendering immediately.
//  */
// function queueRenderPage(num) {
//   if (pageRendering) {
//     pageNumPending = num;
//   } else {
//     renderPage(num);
//   }
// }

// /**
//  * Displays previous page.
//  */
// function onPrevPage() {
//   if (pageNum <= 1) {
//     return;
//   }
//   pageNum--;
//   queueRenderPage(pageNum);
// }


// /**
//  * Displays next page.
//  */
// function onNextPage() {
//   if (pageNum >= totalPageCount && current.documentIndex + 1 === 1) {
//     return;
//   }

//   pageNum++;
//   queueRenderPage(pageNum);
// }

// /**
//  * @returns PageNumber
//  */
// function getPageInfo(num) {
//   let totalPageCount = 0;  
//   let currentCount = fileBackup;
//   totalPageCount += currentCount;
//   if (num <= totalPageCount) {
//     return {
//       documentIndex: i,
//       pageNumber: (currentCount - (totalPageCount - num)),
//     };
//   }
//   return false;
// }

// function getTotalPageCount() {
//   var totalPageCount = 0;
//   for (var docIdx = 0; docIdx < pdfDocs.length; docIdx++) {
//     totalPageCount += pdfDocs[docIdx].numPages;
//   }
//   return totalPageCount;
// }

// var loadedCount = 0;

// function load() {
//   // Load PDFs one after another
//   pdfjsLib.getDocument(URL.createObjectURL(fileBackup)).promise.then(function(pdfDoc_) {
//     console.log("loaded PDF " + loadedCount);
//     pdfDocs.push(pdfDoc_);
//     loadedCount++;
//     if (loadedCount !== 1) {
//       return load();
//     }

//     console.log("Finished loading");
//     totalPageCount = getTotalPageCount();
//     document.getElementById("page_count").textContent = totalPageCount;

//     // Initial/first page rendering
//     renderPage(pageNum);
//   });
// }

// async function unifyPdfPages() {
//   const pdfFile = fileBackup;

//   if (pdfFile) {
//       const fileReader = new FileReader();

//       fileReader.onload = async function () {
//           const data = new Uint8Array(this.result);

//           try {
//               const pdfDoc = await pdfjsLib.getDocument(data).promise;
//               const canvas = document.getElementById('mergedCanvas');
//               const context = canvas.getContext('2d');
              
//               for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
//                   const page = await pdfDoc.getPage(pageNum);
//                   const viewport = await page.getViewport({ scale: 1 });

//                   if (pageNum === 1) {
//                       canvas.width = viewport.width;
//                       canvas.height = viewport.height;
//                   } else {
//                       canvas.height += viewport.height;
//                   }

//                   await page.render({
//                       canvasContext: context,
//                       viewport: viewport
//                   }).promise;
//               }

//               const imgData = canvas.toDataURL('application/pdf', 1.0);

//               // Mostrar el lienzo con la imagen resultante
//               canvas.style.display = 'block';

//               // Mostrar un enlace para descargar el PDF resultante
//               const downloadLink = document.getElementById('downloadLink');
//               downloadLink.href = imgData;
//               downloadLink.style.display = 'block';
//           } catch (error) {
//               console.error('Error al procesar el PDF:', error);
//           }
//       };

//       fileReader.readAsArrayBuffer(pdfFile);
//   } else {
//       alert('Por favor, seleccione un archivo PDF.');
//   }
// }

// function pdfMerge() {
//   //necessário pois para manter as promisses sincronizadas com await
//   (async function loop() {
      
//           const pdfUrl = URL.createObjectURL(fileBackup);
//           var loadingTask = await pdfjsLib.getDocument(pdfUrl);
//           //sem isso fica dessincronizado
//           await loadingTask.promise.then(function (pdf) {
//               pdf.getMetadata().then(function (metaData) {
//                   console.log("pdf (" + urls + ") version: " + metaData.info.PDFFormatVersion); //versão do pdf
//               }).catch(function (err) {
//                   console.log('Error getting meta data');
//                   console.log(err);
//               });
//               console.log("páginas: " + pdf.numPages);
//               let i = 0;
//               while (i < pdf.numPages) {
//                   var pageNumber = i;
//                   pdf.getPage(pageNumber).then(function (page) {
//                       var div = document.createElement("div");
//                       var documentosDiv = document.querySelector('#' + 1);
//                       documentosDiv.appendChild(div);
//                       var canvas = document.createElement("canvas");
//                       div.appendChild(canvas);
//                       // Prepare canvas using PDF page dimensions
//                       var viewport = page.getViewport({scale: 1, });
//                       //var canvas = document.getElementById('the-canvas');
//                       var context = canvas.getContext('2d');
//                       canvas.height = viewport.height;
//                       canvas.width = viewport.width;
//                       // Render PDF page into canvas context
//                       var renderContext = {
//                           canvasContext: context,
//                           viewport: viewport
//                       };
//                       var renderTask = page.render(renderContext);
//                       renderTask.promise.then(function () {
//                           console.log('Page rendered');
//                       });
//                   });
//                   i++;
//               }
//               // Fetch the first page
//           }, function (reason) {
//               // PDF loading error
//               console.error(reason);
//           });
      
//   })();
// }