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

/**********************SERVICE WORKER******************************/
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
/**********************************************************************/

/**************************VARIABLES GLOBALES***************************/
var fileInput;
var selected_device;
var devices = [];
var storedDevices;
let nIntervId;
var statusTexts = ["Buscando dispositivos", "Buscando dispositivos.", "Buscando dispositivos..", "Buscando dispositivos..."];
var contenedor = document.getElementById("contenedor");
var nuevoParrafo;
var fileBackup;
var fileBackupZpl;
var changeHref;
var pdfText = "";
var totalNumPagesTam;
var sPrinter;
var zebraPrinter;

/********************FUNCIONES PARA BUSCAR IMPRESORAS*******************/
function flashText() {
  var currentText = nuevoParrafo.textContent;
  var currentIndex = statusTexts.indexOf(currentText);
  if (currentIndex === -1 || currentIndex === statusTexts.length - 1) {
    currentIndex = -1; // Reiniciar al primer elemento
  }
  nuevoParrafo.textContent = statusTexts[currentIndex + 1];
}

function onDeviceSelected(selected){
	for(var i = 0; i < devices.length; ++i){
		if(selected.value == devices[i].uid){
			selected_device = devices[i];
      // zebraPrinter = new Zebra.Printer(selected_device);
      // zebraPrinter.getInfo(function(info){
      //   console.log(info)
      // }, function(error){
      //   console.log(error)
      // }
      // );
			return;
		}
	}
}

function toggleElements(selectedPrinter) {
  const zebraElements = document.querySelectorAll('.header select, .header p');
  const starElements = document.querySelector('.header select, .header p');
  const buscandoDisp = document.getElementById("BuscandoDisp");
  if (selectedPrinter === "Zebra iMZ220" || selectedPrinter === "Zebra ZQ220") {
      zebraElements.forEach(element => element.style.display = 'block');
      starElements.forEach(element => element.style.display = 'none');
      buscandoDisp.style.display = 'block';
  } else {
      zebraElements.forEach(element => element.style.display = 'none');
      starElements.forEach(element => element.style.display = 'block');
      buscandoDisp.style.display = 'none';
  }
}

function searchPrinters(){
  nuevoParrafo = document.getElementById("BuscandoDisp");
  nuevoParrafo.textContent = "Buscando dispositivos";
  //document.body.appendChild(nuevoParrafo);
  nIntervId = setInterval(flashText, 1000);
  //Get the default device from the application as a first step. Discovery takes longer to complete.
  BrowserPrint.getDefaultDevice("printer", function(device){
    //Add device to list of devices and to html select element
    selected_device = device;
    // zebraPrinter = new Zebra.Printer(selected_device);
    // zebraPrinter.getInfo(function(info){
    //     console.log(info) //"iMZ220-200dpi"
    //   }, function(error){
    //     console.log(error)
    //   }
    // );
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
    //alert(error);
  })
}
/***********************************************************************/

window.addEventListener('load', () => {
  registerServiceWorker()
  sPrinter = document.getElementById("printerSelect").value;
  searchPrinters()
  fileInput = document.getElementById('fileInput');
  inputFileLoad()
  createURL()
});

/************FUNCION PARA IMPRIMIR SEGUN TIPO DE IMPRESORA*************/
function imprimir() {
  // Obtener el valor seleccionado en el elemento select
  var selectedPrinter = document.getElementById("printerSelect").value;
  // Realizar acciones según la opción seleccionada
  if (fileBackup && fileBackup.size > 0) {
    if (selectedPrinter === "Zebra iMZ220") {
      try{
        alert("Imprimiendo en impresora zebra iMZ220...");
        imprimirZebraZpl();
      }catch(error){
        alert("¡Falla al imprimir! Revise la impresora y el tipo de impresora al que se encuentra conectado");
      }
    } else if (selectedPrinter === "Zebra ZQ220") {
      try{
        alert("Imprimiendo en impresora zebra ZQ220...");
        imprimirZebraTxt();
      }catch(error){
        alert("¡Falla al imprimir! Revise la impresora y el tipo de impresora al que se encuentra conectado");
      }
    } else if(selectedPrinter === "Star") {
      try{
        alert("Imprimiendo en impresora star...");
        imprimirStar();
      }catch(error){
        alert("¡Falla al imprimir! Revise la impresora y el tipo de impresora al que se encuentra conectado");
      }
    } else {
        alert("Selecciona una impresora válida (Zebra o Star).");
    }
  } else {
    alert("No hay un archivo cargado para imprimir");
  }
}
/**********************************************************************/

/*****************FUNCIONES PARA IMPRESORA ZEBRA iMZ220****************/
var finishCallback = function(){
	alert("Proceso finalizado");	
}

var errorCallback = function(errorMessage){
	alert("Error: " + errorMessage);	
}

async function imprimirZebraZpl(){
  var zpl=await pdfToZpl(fileBackupZpl);
  const zplArchive = new Blob([zpl], { type: 'text/plain' });
  // const url = window.URL.createObjectURL(zplArchive);
  // const a = document.createElement('a');
  // a.href = url;
  // a.download = "fileUnifiedBackup";
  // a.click();   
  // window.URL.revokeObjectURL(url);
  selected_device.sendFile(zplArchive, finishCallback, errorCallback);
}

async function pdfToZpl(file) {
  const pdfUrl = URL.createObjectURL(file);
  // Obtener el PDF y crear una instancia de pdfJsLib
  const loadPdf = await pdfjsLib.getDocument(pdfUrl);
  // Deserializar el PDF
  const PDFContent = await loadPdf.promise;
  // create content for print.
  //En initial position entre mas grande sea el numero constante, mas alineado a la izquierda estara, en otro caso, mas pequeño a la derecha
  // Obtener la página
  let content = '^XA~TA000~JSN^LT0^MNN^MTT^PON^PMN^LH0,0^JMA^PR5,5~SD15^JUS^LRN^CI0^XZ';
  for (let pageNumber = 1 ; pageNumber <= PDFContent.numPages ; pageNumber++) {
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
    if(pageNumber!=PDFContent.numPages){
      content += '^XA^MMT^PW400^LL590^LH0,0^LS0';
    }else{
      content += '^XA^MMT^PW400^LL'+(590-scale+60)+'^LH0,0^LS0';
    }
    if(pageNumber!=PDFContent.numPages){
      pdf.items.forEach(item => {
        const [fontSize, , , fontWeight, initialPosition, topPosition] = item.transform;
        content += `^FT
                    ${390-initialPosition},
                    ${topPosition-scale}
                    ^A0I,
                    ${fontSize*(1.4)},
                    ${fontWeight}
                    ^FB
                    ${parseInt(item.width)},
                    1,0,C^FH^FD
                    ${(item.str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))}
                    ^FS`;
      })
    } else {
      pdf.items.forEach(item => {
        const [fontSize, , , fontWeight, initialPosition, topPosition] = item.transform;
        content += `^FT
                    ${390-initialPosition},
                    ${topPosition-scale+60}
                    ^A0I,
                    ${fontSize*(1.4)},
                    ${fontWeight}
                    ^FB
                    ${parseInt(item.width)},
                    1,0,C^FH^FD
                    ${(item.str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))}
                    ^FS`;
      })
    }
    //content += '^PQ1,0,1,Y^XZ';
    content += '^XZ';
  }
  contenidoZebra=content;
  console.log("****")
  console.log(content)
  return content
}
/**********************************************************************/

/******************FUNCIONES PARA IMPRESORA STAR***********************/
function createURL() {
	changeHref = 'starpassprnt://v1/print/nopreview?';
  //back
	changeHref = changeHref + "&back=" + encodeURIComponent(window.location.href);
  //size
  changeHref = changeHref + "&size=" + "2w7";
  //pdf
	changeHref = changeHref + "&pdf=" + encodeURIComponent(pdfText);
  //document.getElementById("send_data").value = changeHref;
  console.log("****")
  console.log(changeHref)
}

function getPdf(callback) {
  if (!fileInput.files[0]) {
    pdfText = "";
  } else {
    fileBackup.arrayBuffer().then(resp => {
					
      let binary = new Uint8Array(resp);
      var binaryString = "";
      for (var i=0; i<binary.byteLength; i++) {
        binaryString += String.fromCharCode(binary[i]);
      }

      // base64 encoding
      pdfText = window.btoa(binaryString);
      createURL()
    })
  }
  createURL();
}

function imprimirStar(){
  location.href=changeHref;
}
/**********************************************************************/

/*********FUNCIONES PARA INPUT FILE O FILE RECIBIDO EXTERNAMENTE*******/
function displayPdf(file) {
  // Verificar si el archivo es de tipo PDF
  if (file.type === 'application/pdf') {
    alert("Archivo cargado correctamente");
    fileBackup=file;
    fileBackupZpl=file;
  } else {
    alert('El archivo no es de tipo PDF, cargue un nuevo')
    console.error('El archivo no es de tipo PDF');
  }
}

// Agrega un event listener al input file para el evento 'change'
function inputFileLoad() {
  fileInput.addEventListener('change', function() {
    var file = fileInput.files[0]; // Obtener el archivo seleccionado
    if (file) {
      displayPdf(file);
      combineAllPDFPages().then(archive => {
        fileBackup=archive;
        fileBackupZpl=file;
        getPdf(createURL);
      });
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
  combineAllPDFPages().then(archive => {
    fileBackup=archive;
    getPdf(createURL);
  });
});

async function combineAllPDFPages() {
  const pdfBytes = await fetch(URL.createObjectURL(fileBackup)).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFLib.PDFDocument.create();
  const fileBackupPdf = await PDFLib.PDFDocument.load(pdfBytes);
  originalPage = await pdfDoc.embedPage(fileBackupPdf.getPages()[0]);
  preambleDims = originalPage.scale(1.0);
  totalNumPagesTam = 8.3*fileBackupPdf.getPages().length*100;
  const page = pdfDoc.addPage([preambleDims.width,preambleDims.height*fileBackupPdf.getPages().length]);
  for(paginaActual=0 ; paginaActual<fileBackupPdf.getPages().length ; paginaActual++){
    originalPage = await pdfDoc.embedPage(fileBackupPdf.getPages()[paginaActual]);
    preambleDims = originalPage.scale(1.0);
    page.drawPage(originalPage, {
      ...preambleDims,
      x: page.getWidth() / preambleDims.width,
      y: (page.getHeight() / preambleDims.height)+(preambleDims.height*(fileBackupPdf.getPages().length-(paginaActual+1))),
    });
  }
  const mergedPdfBytes = await pdfDoc.save();
  const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
  return new File([blob], "file", { type: 'application/pdf' });
}
/**********************************************************************/

/*****************FUNCIONES PARA IMPRESORA ZEBRA ZQZ220****************/
function txtInventaryReport(textContent){
  let caracteresLineaMax = 0;
  let arriveDescription = false;
  const finalReportNamePosition = 9;
  const positionExistences = 42;
  let codeProductRead = 0;
  let text = '! U1 JOURNAL\r\n! U1 SETLP 7 0 24\r\n! UTILITIES LT CR-X-LF PRINT\r\n           ';
  let actualContent;
  for (let content = 0 ; content < textContent.items.length-1 ; content++) {
    actualContent = textContent.items[content].str;
    //console.log('LOS ITEMS: ' + actualContent + ' °°°°°° ' + textContent.items[content].hasEOL + ' |||||| ' + textContent.items[content+1].hasEOL);
    if (content == finalReportNamePosition){
      text += '\r\n \r\n';
    } else if (actualContent.toLowerCase().includes('ruta:')) {
      text += '\r\n \r\n';
      text += actualContent;
    } else if (actualContent.toLowerCase().includes('vendedor:')) {
      text += '\r\n \r\n';
      text += actualContent;
    } else if (actualContent.includes('PRODUCTO')) {
      text += '\r\n \r\n \r\n';
      text += actualContent;
      text += '                            '
    } else if (actualContent.toLowerCase().includes('existencias')) {
      arriveDescription = true;
      text += actualContent;
      text += '\r\n \r\n \r\n';
      content++;
    } else if (arriveDescription) {
      if (codeProductRead == 0) { //Se el primer item del producto
        codeProductRead = 1;
        text += actualContent;
        caracteresLineaMax = caracteresLineaMax + actualContent.length;
      } else if (codeProductRead == 1 && /^\d+$/.test(actualContent) && textContent.items[content+1].hasEOL) { //Si el codigo de producto tiene un enter despues, siga con el siguiente producto
        for (let spaces = 0 ; spaces < positionExistences-caracteresLineaMax ; spaces++) {
          text += ' ';
        }
        text += actualContent;
        caracteresLineaMax = 0;
        codeProductRead = 0;
        text += '\r\n';
      } else if (codeProductRead == 1 && /^\d+$/.test(actualContent) && textContent.items[content+1].str == '') { //Si el codigo de producto tiene un contenido vacio despues, siga con el siguiente producto
        for (let spaces = 0 ; spaces < positionExistences-caracteresLineaMax ; spaces++) {
          text += ' ';
        }
        text += actualContent;
        caracteresLineaMax = 0;
        codeProductRead = 0;
        text += '\r\n';
      } else if (codeProductRead == 1 && /^\d+$/.test(actualContent) && textContent.items[content+1].str != ' ' ) { //Si el codigo de producto esta al final de una pagina del pdf, verifique que haya algo en la siguiente pagina y siga
        for (let spaces = 0 ; spaces < positionExistences-caracteresLineaMax ; spaces++) {
          text += ' ';
        }
        text += actualContent;
        text += '\r\n';
        caracteresLineaMax = 0;
        codeProductRead = 0;
      } else if (codeProductRead == 1 && textContent.items[content+1].hasEOL && /^\d+$/.test(textContent.items[content+2].str)) {
        text += actualContent;
        caracteresLineaMax = caracteresLineaMax + actualContent.length;
      } else if (codeProductRead == 1 && textContent.items[content+1].hasEOL) {
        caracteresLineaMax = 0;
        text += actualContent;
        text += '\r\n';
      } else if (codeProductRead == 1) {
        text += actualContent;
        caracteresLineaMax = caracteresLineaMax + actualContent.length;
      }
    } else {
      text += actualContent;
    }
  }
  for (let spaces = 0 ; spaces < positionExistences-caracteresLineaMax ; spaces++) {
    text += ' ';
  }
  text += textContent.items[textContent.items.length-1].str;
  return text += '\r\n \r\n \r\n';
}

function txtRetailSales(textContent){
  let caracteresLineaMax = 0;
  let countInv = 1;
  let invInicialFinal = false;
  let text = '! U1 JOURNAL\r\n! U1 SETLP 7 0 24\r\n! UTILITIES LT CR-X-LF PRINT\r\n                ';
  let actualContent;
  let codeProductRead = 0;
  const positionCantidadInvFinal = 34;
  const positionTotal = 48;
  let spacesToFinal = 0;
  let totalAppear = false;
  let totalRepeats = 0;
  let centerTotalsFinal = 24;
  let productAppear = false;
  for (let content = 0 ; content < textContent.items.length-2 ; content++) {
    actualContent = textContent.items[content].str;
    console.log('Palabra actual: '+actualContent+' Tiene espacio: '+textContent.items[content].hasEOL );
      debugger
    if (actualContent.toLowerCase().includes('detalle')){
      text += actualContent;
    } else if (actualContent.toLowerCase().includes('reporte')) {
      text += '\r\n \r\n         ';
      text += actualContent;
    } else if (actualContent.toLowerCase().includes('fecha')) {
      text += actualContent;
    } else if (actualContent.toLowerCase().includes('ruta:')) {
      text += '\r\n \r\n';
      text += actualContent;
    } else if (actualContent.toLowerCase().includes('vendedor:')) {
      text += '\r\n \r\n';
      text += actualContent;
    } else if (actualContent.toLowerCase().includes('producto') && !productAppear) {
      text += '\r\n \r\n \r\n';
      text += actualContent;
      text += '                     '
      productAppear = true;
    } else if (actualContent.toLowerCase().includes('cantidad')) {
      text += actualContent;
      text += '    '
    } else if (actualContent.toLowerCase().includes('total') && !totalAppear) {
      text += actualContent;
      text += '\r\n \r\n';
    } else if (actualContent.toLowerCase().includes('Inv.')) {
      text += actualContent;
      countInv++;
    } else if (actualContent.toLowerCase().includes('inicial')) {
      text += actualContent;
      text += '                '
    } else if (actualContent.toLowerCase().includes('final')) {
      invInicialFinal = true;
      text += actualContent;
      text += '\r\n \r\n \r\n';
      content++;
    } else if (invInicialFinal) {
      if (codeProductRead == 0 && actualContent != '' && actualContent != ' ') { //Se el primer item del producto
        codeProductRead = 1;
        text += actualContent;
        caracteresLineaMax = caracteresLineaMax + actualContent.length;
      } else if (codeProductRead == 5 && /^\d+(\.\d+)?$/.test(actualContent)){
        text += actualContent;
        codeProductRead = 0;
        caracteresLineaMax = 0;
        if(textContent.items[content + 1].str == ' '){
          content++;
          text += '\r\n \r\n';
        } else if (textContent.items[content + 2].str.toLowerCase().includes('total')){
          totalAppear = true;
          invInicialFinal = false;
        } else {
          text += '\r\n \r\n';
        }
      } else if (codeProductRead == 4 && /^\d+(\.\d+)?$/.test(actualContent)){
        text += actualContent;
        codeProductRead = 5;
        caracteresLineaMax = caracteresLineaMax + actualContent.length;
        for (let spaces = 0 ; spaces < positionCantidadInvFinal-caracteresLineaMax-Math.round(textContent.items[content + 2].str.length/2) ; spaces++) {
          text += ' ';
        }
      } else if (codeProductRead == 3 && /^\$\d+(\.\d+)?$/.test(actualContent)) {
        text += actualContent;
        codeProductRead = 4;
        caracteresLineaMax = 0;
        content++;
        text += '\r\n';
      }else if (codeProductRead == 2 && /^\d+(\.\d+)?$/.test(actualContent)) {
        text += actualContent;
        codeProductRead = 3;
        caracteresLineaMax = caracteresLineaMax + actualContent.length + spacesToFinal;
        for (let spaces = 0 ; spaces < positionTotal-caracteresLineaMax-textContent.items[content + 2].str.length ; spaces++) {
          text += ' ';
        }
        spacesToFinal = 0;
      } else if (codeProductRead == 1 && /^\d+(\.\d+)?$/.test(textContent.items[content + 2].str) && /^\$\d+(\.\d+)?$/.test(textContent.items[content + 4].str)) {
        text += actualContent;
        caracteresLineaMax = caracteresLineaMax + actualContent.length;
        for (let spaces = 0 ; spaces < positionCantidadInvFinal-caracteresLineaMax-Math.round(textContent.items[content + 2].str.length/2) ; spaces++) {
          text += ' ';
          spacesToFinal++;
        }
        codeProductRead = 2;
      } else if (codeProductRead == 1 && textContent.items[content+1].hasEOL) {
        caracteresLineaMax = 0;
        text += actualContent;
        text += '\r\n';
      } else if (codeProductRead == 1) {
        text += actualContent;
        caracteresLineaMax = caracteresLineaMax + actualContent.length;
      }
    } else if (totalAppear) {
      if(actualContent.toLowerCase().includes('total:')){
        text += '\r\n \r\n';
        for(let spaces = 0 ; spaces < centerTotalsFinal-Math.round((actualContent.length+textContent.items[textContent.items.length-1].str.length)/2) ; spaces++) {
          text += ' ';
        }
        text += actualContent;
        text += ' ' + textContent.items[textContent.items.length-1].str;
      } else if (actualContent.toLowerCase().includes('total')) {
        if (totalRepeats == 0){
          text += '\r\n \r\n';
          for (let spaces = 0 ; spaces < centerTotalsFinal-Math.round((actualContent.length+textContent.items[content+1].str.length+textContent.items[content+2].str.length+textContent.items[content+3].str.length+textContent.items[content+4].str.length)/2) ; spaces++) {
            text += ' ';
          }
          text += actualContent;
        }
      } else {
        text += actualContent;
      }
    } else {
      text += actualContent;
    }
  }
  return text += '\r\n \r\n \r\n';
}

function txtPurchase(textContent) {
  let text = '! U1 JOURNAL \r\n! U1 SETLP 7 0 24 \r\n! UTILITIES LT CR-X-LF PRINT \r\n! COUNTRY LATIN9                ';
  let actualContent;
  let afterClient = true;
  let caracteresLineaMax = 0;
  let importLine = false;
  let totalAppear = false;
  let caseBuyLine = false;
  let subTotal = false;
  let totalPage = 48;
  const centerPage = 24;
  let codeProductRead = 0;
  let centerQuantity = 23;
  let centerPriceUnit = 33;
  let spacesToFinal = 0;
  let count = 0;
  for (let content = 0 ; content < textContent.items.length-1 ; content++) {
    actualContent = textContent.items[content].str;
    console.log('LOS ITEMS: ' + actualContent);
    if (actualContent.toLowerCase().includes('ticket')){
      text += '                  ';
      text += actualContent;
    } else if (actualContent.toLowerCase().includes('cliente:')) {
      text += '\r\n \r\n';
      text += actualContent;
      afterClient = true;
    } else if (afterClient && textContent.items[content].hasEOL) {
      text += '\r\n \r\n';
      text += actualContent;
      afterClient = false;
    } else if (actualContent.toLowerCase().includes('dirección:')) {
      text += '\r\n \r\n';
      text += actualContent;
    } else if (actualContent.toLowerCase().includes('fecha')) {
      text += '\r\n \r\n';
      text += actualContent;
      caseBuyLine = false;
    } else if (actualContent.toLowerCase().includes('orden')) {
      text += '\r\n \r\n';
      text += actualContent;
    } else if (actualContent.toLowerCase().includes('condición')) {
      text += '\r\n \r\n';
      text += actualContent;
    } else if (actualContent.toLowerCase().includes('elaboró:')) {
      text += '\r\n \r\n';
      text += actualContent;
    } else if (actualContent.toLowerCase().includes('descripción')) {
      text += '\r\n \r\n \r\n';
      text += actualContent;
      text += '        ';
      productAppear = true;
    } else if (actualContent.toLowerCase().includes('cant.')) {
      text += actualContent;
      text += ' '
    } else if (actualContent.toLowerCase().includes('precio')) {
      text += actualContent;
    } else if (actualContent.toLowerCase().includes('unit.')) {
      text += actualContent;
      text += '   '
    } else if (actualContent.toLowerCase().includes('total')  && !totalAppear) {
      text += actualContent;
      text += '\r\n \r\n';
      totalAppear = true
    } else if (actualContent.toLowerCase().includes('sub-')) {
      text += ' \r\n'
      for (let spaces = 0; spaces<centerPage-Math.round((actualContent.length+textContent.items[content+1].str.length+textContent.items[content+2].str.length+textContent.items[content+3].str.length+textContent.items[content+4].str.length+textContent.items[content+5].str.length)/2) ; spaces++){
        text += ' '
      }
      text += actualContent;
      subTotal = true;
    } else if (actualContent.toLowerCase().includes('descuento:') || actualContent.toLowerCase().includes('impuesto:')) {
      text += '\r\n \r\n'
      for (let spaces = 0; spaces<centerPage-Math.round((actualContent.length+textContent.items[content+1].str.length+textContent.items[content+2].str.length+textContent.items[content+3].str.length+textContent.items[content+4].str.length)/2) ; spaces++){
        text += ' '
      }
      text += actualContent;
    } else if (actualContent.toLowerCase().includes('total')  && textContent.items[content-1].str.toLowerCase().includes('sub-')) {
      text += actualContent;
    } else if (actualContent.toLowerCase().includes('total:') && totalAppear) {
      text += '\r\n \r\n'
      for (let spaces = 0; spaces<centerPage-Math.round((actualContent.length+textContent.items[content+1].str.length+textContent.items[content+2].str.length+textContent.items[content+3].str.length+textContent.items[content+4].str.length)/2) ; spaces++){
        text += ' '
      }
      text += actualContent;
    } else if(actualContent.toLowerCase().includes('importe')) {
      caracteresLineaMax = 0;
      text += '\r\n \r\n';
      text += actualContent;
      caracteresLineaMax = caracteresLineaMax + actualContent.length;
      importLine = true;
    } else if(actualContent.toLowerCase().includes('***copia***')) {
      text += '\r\n \r\n';
      for (let spaces = 0; spaces<centerPage-Math.round(actualContent.length/2) ; spaces++){
        text += ' '
      }
      text += actualContent;
      text += '\r\n \r\n';
      caracteresLineaMax = 0;
      importLine = false;
      caseBuyLine = true;
    } else if(importLine) {
      caracteresLineaMax = caracteresLineaMax + actualContent.length;
      if (caracteresLineaMax <= totalPage){
        text += actualContent;
      } else if (actualContent == ' ' && caracteresLineaMax == 1) {
        caracteresLineaMax = caracteresLineaMax - actualContent.length;
      } else {
        caracteresLineaMax = 0;
        text += '\r\n ';
        text += actualContent;
        caracteresLineaMax = caracteresLineaMax + actualContent.length;
      }
    } else if(caseBuyLine) {
      caracteresLineaMax = caracteresLineaMax + actualContent.length;
      if (caracteresLineaMax <= totalPage){
        text += actualContent;
      } else if (actualContent == ' ' && caracteresLineaMax == 1) {
        caracteresLineaMax = caracteresLineaMax - actualContent.length;
      } else {
        caracteresLineaMax = 0;
        text += '\r\n';
        text += actualContent;
        caracteresLineaMax = caracteresLineaMax + actualContent.length;
      }
    } else if (totalAppear && !subTotal) {
      if (codeProductRead == 0 && actualContent != '' && actualContent != ' ') { //Se el primer item del producto
        codeProductRead = 1;
        text += actualContent;
        caracteresLineaMax = caracteresLineaMax + actualContent.length;
      } else if (codeProductRead == 4){
        if (count == 0) {
          text += actualContent;
          count = 1;
        } else if (count == 1) {
          text += actualContent;
          count = 2;
        } else if (count == 2) {
          text += actualContent;
          count = 3;
        } else {
          if(actualContent == ' '){
            content++;
            text += '\r\n';
          } else {
            text += '\r\n';
          }
          count = 0;
          caracteresLineaMax = 0;
          codeProductRead = 0;
        }
      } else if (codeProductRead == 3) {
        if(textContent.items[content+2].str == '$'){
          text += actualContent;
          codeProductRead = 4;
          caracteresLineaMax = caracteresLineaMax + actualContent.length + spacesToFinal;
          for (let spaces = 0 ; spaces < totalPage-caracteresLineaMax-(textContent.items[content + 2].str.length+textContent.items[content + 3].str.length+textContent.items[content + 4].str.length) ; spaces++) {
            text += ' ';
          }
          spacesToFinal = 0;
          content++;
        } else{
          text += actualContent;
          caracteresLineaMax = caracteresLineaMax + actualContent.length;
        }
      }else if (codeProductRead == 2) {
        text += actualContent;
        codeProductRead = 3;
        caracteresLineaMax = caracteresLineaMax + actualContent.length + spacesToFinal;
        spacesToFinal = 0;
        for (let spaces = 0 ; spaces < centerPriceUnit-caracteresLineaMax-Math.round((textContent.items[content + 2].str.length+textContent.items[content + 3].str.length+textContent.items[content + 4].str.length)/2) ; spaces++) {
          text += ' ';
          spacesToFinal++;
        }
        content++;
      } else if (codeProductRead == 1 && textContent.items[content + 4].str == '$') {
        text += actualContent;
        caracteresLineaMax = caracteresLineaMax + actualContent.length;
        for (let spaces = 0 ; spaces < centerQuantity-caracteresLineaMax-Math.round(textContent.items[content + 2].str.length/2) ; spaces++) {
          text += ' ';
          spacesToFinal++;
        }
        content++;
        codeProductRead = 2;
      } else if (codeProductRead == 1 && textContent.items[content+1].hasEOL) {
        caracteresLineaMax = 0;
        text += actualContent;
        text += '\r\n';
      } else if (codeProductRead == 1) {
        text += actualContent;
        caracteresLineaMax = caracteresLineaMax + actualContent.length;
      }
    } else {
      text += actualContent;
    }
  }
  return text += '\r\n \r\n \r\n';
}

async function createTxtFromPdf(fileBackup) {
  if (!fileBackup) {
    return ''; // Devuelve una cadena vacía si no hay archivo
  }
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = function() {
      const arrayBuffer = this.result;

      pdfjsLib.getDocument(arrayBuffer).promise.then(async function(pdfDoc) {
        let text = '';
        const numPages = pdfDoc.numPages;

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          const page = await pdfDoc.getPage(pageNum);
          const textContent = await page.getTextContent();

          for (const textItem of textContent.items) {
            if (textItem.str.toLowerCase().includes('inventario')) {
              text = txtInventaryReport(textContent);
              resolve(text);
              return;
            } else if (textItem.str.toLowerCase().includes('ticket')) {
              text = txtPurchase(textContent);
              resolve(text);
              return;
            } else if (textItem.str.toLowerCase().includes('liquidación')) {
              text = txtRetailSales(textContent);
              resolve(text);
              return;
            }
          }
          if (pageNum === numPages) {
            resolve(text);
          }
        }
      });
    };
    fileReader.readAsArrayBuffer(fileBackup);
  });
}

async function imprimirZebraTxt() {
  const txt = await createTxtFromPdf(fileBackup);
  const txtArchive = new Blob([txt], { type: 'text/plain' });
  // const url = window.URL.createObjectURL(txtArchive);
  // const a = document.createElement('a');
  // a.href = url;
  // a.download = "fileUnifiedBackup";
  // a.click();
  // window.URL.revokeObjectURL(url);
  selected_device.sendFile(txtArchive, finishCallback, errorCallback);
}

async function descargarZebraTxt() {
  const txt = await createTxtFromPdf(fileBackup);
  const txtArchive = new Blob([txt], { type: 'text/plain' });
  const url = window.URL.createObjectURL(txtArchive);
  const a = document.createElement('a');
  a.href = url;
  a.download = "fileUnifiedBackup";
  a.click();
  window.URL.revokeObjectURL(url);
}
/**********************************************************************/


// CODIGO PARA DESCARGAR UN ARCHIVO
// const url = window.URL.createObjectURL(fileBackup);
// const a = document.createElement('a');
// a.href = url;
// a.download = "fileUnifiedBackup";
// a.click();
// window.URL.revokeObjectURL(url);

// const url = window.URL.createObjectURL(zplArchive);
  // const a = document.createElement('a');
  // a.href = url;
  // a.download = "fileUnifiedBackup";
  // a.click();
  // window.URL.revokeObjectURL(url);