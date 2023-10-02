function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js?version=20')
      .then(registration => {
        alert('Service Worker registrado con éxito:', registration);
        //console.log('Service Worker registrado con éxito:', registration);
      })
      .catch(error => {
        alert('Error al registrar el Service Worker:', error);
        //console.error('Error al registrar el Service Worker:', error);
      });
  }
}

/**************ZEBRA ******************/
var selected_device;
var devices = [];
function setupZebra()
{
	//Get the default device from the application as a first step. Discovery takes longer to complete.
	BrowserPrint.getDefaultDevice("printer", function(device)
			{
		
				//Add device to list of devices and to html select element
				selected_device = device;
				devices.push(device);
				var html_select = document.getElementById("selected_device");
				var option = document.createElement("option");
				option.text = device.name;
				html_select.add(option);
				
				//Discover any other devices available to the application
				BrowserPrint.getLocalDevices(function(device_list){
					for(var i = 0; i < device_list.length; i++)
					{
						//Add device to list of devices and to html select element
						var device = device_list[i];
						if(!selected_device || device.uid != selected_device.uid)
						{
							devices.push(device);
							var option = document.createElement("option");
							option.text = device.name;
							option.value = device.uid;
							html_select.add(option);
						}
					}
					
				}, function(){alert("Error getting local devices")},"printer");
				
			}, function(error){
				alert(error);
			})
}

function onDeviceSelected(selected)
{
	for(var i = 0; i < devices.length; ++i){
		if(selected.value == devices[i].uid)
		{
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


function writeToSelectedPrinter(dataToWrite)
{
	selected_device.send(dataToWrite, undefined, errorCallback);
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

function displayImage(file) {
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.onload = () => {
    URL.revokeObjectURL(url);
  };
  alert(url)
  img.src = url;
  document.body.append(img);
}

function displayPdf(file){
  //document.write(file)
  alert("PDF cargado")
}

function displayFile(file) {
  const ul = document.createElement('ul');
  document.body.append(ul);

  for (const prop of ['name', 'size', 'type']) {
    const li = document.createElement('li');
    li.textContent = `${prop} 22 = ${file[prop]}`;
    ul.append(li);
  }
  
  displayPdf(file);
}

navigator.serviceWorker.onmessage = (event) => {
  alert("On message")
  const file = event.data.file;
  displayFile(file);
};
