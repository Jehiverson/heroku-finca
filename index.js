const express = require('express');
const cors = require('cors');
const Configuration = require('./Configuration');
const cybersourceRestApi =require('cybersource-rest-client');
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

app.use((req, res, next) =>{
    res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
	res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

    next();
});

async function esperarXSegundos(segundos) {
    const esperaMilisegundos = segundos * 1000;
    let tiempoTranscurrido = 0;
    const intervalo = 1000; // Intervalo de espera en milisegundos (1 segundo en este caso)
  
    while (tiempoTranscurrido < esperaMilisegundos) {
      await new Promise(resolve => setTimeout(resolve, intervalo));
      tiempoTranscurrido += intervalo;
      console.log(`Han pasado ${tiempoTranscurrido / 1000} segundos.`);
    }
  
    console.log('Espera completa.');
  }

const simple_authorization_internet = async (_req, res) => {
    try {
      const {
        numberCard,
        expirationMonth,
        expirationYear,
        securityCode,
        totalAmount,
      } = _req.body;
      console.log(_req.body);
      // Declarar las variables locales aquí
      const configObject = new Configuration();
      const enable_capture = true;
      const apiClient = new cybersourceRestApi.ApiClient();
      const requestObj = new cybersourceRestApi.CreatePaymentRequest();
  
      const clientReferenceInformation = new cybersourceRestApi.Ptsv2paymentsClientReferenceInformation();
      clientReferenceInformation.code = 'TC50171_3';
      requestObj.clientReferenceInformation = clientReferenceInformation;
  
      const processingInformation = new cybersourceRestApi.Ptsv2paymentsProcessingInformation();
      processingInformation.capture = false;
      processingInformation.profile = "AB4F294B-4EE9-4650-986D-E434073B9824";
      if (enable_capture === true) {
        processingInformation.capture = true;
      }
      requestObj.processingInformation = processingInformation;
  
      const paymentInformation = new cybersourceRestApi.Ptsv2paymentsPaymentInformation();
      const paymentInformationCard = new cybersourceRestApi.Ptsv2paymentsPaymentInformationCard();
      paymentInformationCard.number = numberCard;
      paymentInformationCard.expirationMonth = expirationMonth;
      paymentInformationCard.expirationYear = expirationYear;
      paymentInformationCard.securityCode = securityCode;
      paymentInformation.card = paymentInformationCard;
      requestObj.paymentInformation = paymentInformation;
  
      const orderInformation = new cybersourceRestApi.Ptsv2paymentsOrderInformation();
      const orderInformationAmountDetails = new cybersourceRestApi.Ptsv2paymentsOrderInformationAmountDetails();
      orderInformationAmountDetails.totalAmount = totalAmount;
      orderInformationAmountDetails.currency = 'GTQ';
      orderInformation.amountDetails = orderInformationAmountDetails;
      console.log('\nData : ', 1)
      const orderInformationBillTo = new cybersourceRestApi.Ptsv2paymentsOrderInformationBillTo();
      orderInformationBillTo.firstName = 'John';
      orderInformationBillTo.lastName = 'Doe';
      orderInformationBillTo.address1 = '1 Market St';
      orderInformationBillTo.locality = 'san francisco';
      orderInformationBillTo.administrativeArea = 'CA';
      orderInformationBillTo.postalCode = '94105';
      orderInformationBillTo.country = 'US';
      orderInformationBillTo.email = 'test@cybs.com';
      orderInformationBillTo.phoneNumber = '4158880000';
      orderInformation.billTo = orderInformationBillTo;
      requestObj.orderInformation = orderInformation;
      console.log('\nData : ', 2)
      const instance = new cybersourceRestApi.PaymentsApi(configObject, apiClient);
      //console.log("[ REQUEST OBJECT ] > ", requestObj);
      console.log('\nData : ', 3)
      // Utiliza una promesa para crear el pago
      let dataArray = []; // Cambia el nombre de la variable a "dataArray" o el nombre que prefieras
      
      const datospayment = instance.createPayment(requestObj, function (error, data, response) {
        if (error) {
          console.log('\nError : ' + JSON.stringify(error));
        }
  
        console.log('\nResponse Code of Process a Payment : ' + JSON.stringify(response['status']));
        let status = response['status'];
        //write_log_audit(status);
        console.log("Datos finales", response.text)
        dataArray.push({ datos: JSON.stringify(response) });
      });
      console.log('\nData : ', 5)
      const receipt = {
        "nombre": "Jehiverson Alberto Rodriguez Trujillo",
        "fecha": "2023-09-20",
        "precioCorte": 800,
        "cantidadCorte": 0,
        "precioVisita": 800,
        "cantidadVisita": 2,
        "total": 1600,
        "phone": 35303737,
        "email": "jehivis@gmail.com"
    }
      console.log('\nData 6 : ', dataArray)
      await esperarXSegundos(2);
      res.status(200).json({
        dataArray,
        datospayment,
        status: 'OK'
      });
    } catch (error) {
      console.log('\nData : ', 99)
      console.error('\nException on calling the API : ' + error);
  
      // Enviar la respuesta de error al cliente
      res.status(500).json({
        error,
        status: 'CATCH'
      });
    }
  }

// Configurar rutas
app.get('/', (req, res) => {
  res.send('¡Hola, mundo!');
});

app.post('/', simple_authorization_internet);
  

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor Express escuchando en el puerto ${port}`);
});
