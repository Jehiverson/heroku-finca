const express = require('express');
const cors = require('cors');
const cybersourceRestApi = require('cybersource-rest-client');

const Configuration = require('./Configuration');
const protectRoute = require('./middleware/protectionRouter')
const _tokenFunctions = require('./middleware/_tokenFunctions')

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

const enroll_with_pending_authentication = (_req, res) => {
  try {
    const {
      numberCard,
      expirationMonth,
      expirationYear,
      totalAmount,
      fingerprintSessionId
    } = _req.body;
    console.log(totalAmount)
    // Declarar las variables locales aquí
    const configObject = new Configuration();
    const apiClient = new cybersourceRestApi.ApiClient();
    const requestObj = new cybersourceRestApi.CreatePaymentRequest();

    const clientReferenceInformation = new cybersourceRestApi.Riskv1decisionsClientReferenceInformation();
		clientReferenceInformation.code = 'erollment';
		requestObj.clientReferenceInformation = clientReferenceInformation;

    const orderInformation = new cybersourceRestApi.Riskv1authenticationsOrderInformation();
		const orderInformationAmountDetails = new cybersourceRestApi.Riskv1authenticationsOrderInformationAmountDetails();
		orderInformationAmountDetails.currency = 'GTQ';
		orderInformationAmountDetails.totalAmount = totalAmount;
		orderInformation.amountDetails = orderInformationAmountDetails;

    const orderInformationBillTo = new cybersourceRestApi.Riskv1authenticationsOrderInformationBillTo();
		orderInformationBillTo.firstName = 'John';
		orderInformationBillTo.lastName = 'Doe';
		orderInformationBillTo.address1 = 'Ciudad Guatemala';
    orderInformationBillTo.address2 = 'Guatemala';
		orderInformationBillTo.locality = 'Guatemala';
		orderInformationBillTo.administrativeArea = 'CA';
		orderInformationBillTo.postalCode = '01001';
		orderInformationBillTo.country = 'GT';
		orderInformationBillTo.email = 'null@cybersource.com';
		orderInformationBillTo.phoneNumber = '4158880000';
		orderInformation.billTo = orderInformationBillTo;
		requestObj.orderInformation = orderInformation;

		const paymentInformation = new cybersourceRestApi.Riskv1authenticationsetupsPaymentInformation();
		const paymentInformationCard = new cybersourceRestApi.Riskv1authenticationsetupsPaymentInformationCard();
		paymentInformationCard.type = '001';
		paymentInformationCard.expirationMonth = expirationMonth;
		paymentInformationCard.expirationYear = expirationYear;
		paymentInformationCard.number = numberCard;
		paymentInformation.card = paymentInformationCard;
    
    requestObj.paymentInformation = paymentInformation;

    const consumerAuthenticationInformation = new cybersourceRestApi.Riskv1decisionsConsumerAuthenticationInformation();
		consumerAuthenticationInformation.transactionMode = 'MOTO';
		requestObj.consumerAuthenticationInformation = consumerAuthenticationInformation;

    const deviceInformation = new cybersourceRestApi.Ptsv2paymentsDeviceInformation();
    deviceInformation.fingerprintSessionId = fingerprintSessionId;
		requestObj.deviceInformation = deviceInformation;

    console.log("[ REQUEST OBJECT ENROLLMENT ] > ", requestObj);
    const instance = new cybersourceRestApi.PayerAuthenticationApi(configObject, apiClient);
    
    console.log('\nData : ', 3)
    // Utiliza una promesa para crear el pago
    instance.checkPayerAuthEnrollment( requestObj, function (error, data, response) {
      if (error) {
        console.log('\nError : ' + JSON.stringify(error));
        write_log_audit(JSON.parse(error.response.text));
      }else if (data) {
        console.log('\nData : ' + JSON.stringify(data));
      }

      console.log('\nResponse : ' + JSON.stringify(response));
      console.log('\nResponse Code of Process a Payment : ' + JSON.stringify(response['status']));
      console.log(error, data, response);
      res.status(200).json({
        error,
        data,
        response,
        status: 'OK'
      });
    });
    console.log('\nData : ', 5)
  }
  catch (error) {
    console.log('\nException on calling the API : ' + error);
    res.status(200).json({
      error,
      status: 'ERROR'
    });
  }
}

const setup_completion_with_card_number = (_req, res) => {
  try {
    const {
      numberCard,
      expirationMonth,
      expirationYear
    } = _req.body;
    
    // Declarar las variables locales aquí
    const configObject = new Configuration();
    const apiClient = new cybersourceRestApi.ApiClient();
    const requestObj = new cybersourceRestApi.CreatePaymentRequest();

    const clientReferenceInformation = new cybersourceRestApi.Riskv1decisionsClientReferenceInformation();
    clientReferenceInformation.code = 'authentication_setup';
    const clientReferenceInformationPartner = new cybersourceRestApi.Riskv1decisionsClientReferenceInformationPartner();
    clientReferenceInformationPartner.developerId = '7891234';
    clientReferenceInformationPartner.solutionId = '89012345';
    clientReferenceInformation.partner = clientReferenceInformationPartner;

    requestObj.clientReferenceInformation = clientReferenceInformation;

    const paymentInformation = new cybersourceRestApi.Riskv1authenticationsetupsPaymentInformation();
    const paymentInformationCard = new cybersourceRestApi.Riskv1authenticationsetupsPaymentInformationCard();
    paymentInformationCard.type = '001';
    paymentInformationCard.expirationMonth = expirationMonth;
    paymentInformationCard.expirationYear = expirationYear;
    paymentInformationCard.number = numberCard;
    paymentInformation.card = paymentInformationCard;
    
    requestObj.paymentInformation = paymentInformation;

    console.log("[ REQUEST OBJECT SETUP ] > ", requestObj);
    const instance = new cybersourceRestApi.PayerAuthenticationApi(configObject, apiClient);
    
    console.log('\nData : ', 3)
    // Utiliza una promesa para crear el pago
    instance.payerAuthSetup(requestObj, function (error, data, response) {
      if (error) {
        console.log('\nError : ' + JSON.stringify(error));
        write_log_audit(JSON.parse(error.response.text));
      }else if (data) {
        console.log('\nData : ' + JSON.stringify(data));
      }

      console.log('\nResponse : ' + JSON.stringify(response));
      console.log('\nResponse Code of Process a Payment : ' + JSON.stringify(response['status']));
      console.log(error, data, response);
      res.status(200).json({
        error,
        data,
        response,
        status: 'OK'
      });
    });
    console.log('\nData : ', 5)
  }
  catch (error) {
    console.log('\nException on calling the API : ' + error);
    res.status(200).json({
      error,
      status: 'ERROR'
    });
  }
}

const simple_authorization_internet = async (_req, res) => {
  try {
    const {
      numberCard,
      expirationMonth,
      expirationYear,
      securityCode,
      totalAmount,
      fingerprintSessionId,
      referenceId,
      authenticationTransactionId,
    } = _req.body;

    // Declarar las variables locales aquí
    const configObject = new Configuration();
    const enable_capture = true;
    const apiClient = new cybersourceRestApi.ApiClient();
    const requestObj = new cybersourceRestApi.CreatePaymentRequest();

    const clientReferenceInformation = new cybersourceRestApi.Ptsv2paymentsClientReferenceInformation();
    clientReferenceInformation.code = 'payment';
    requestObj.clientReferenceInformation = clientReferenceInformation;

    const consumerAuthenticationInformation = new cybersourceRestApi.Ptsv2paymentsConsumerAuthenticationInformation();
		consumerAuthenticationInformation.referenceId = referenceId;
    consumerAuthenticationInformation.authenticationTransactionId = authenticationTransactionId;
		requestObj.consumerAuthenticationInformation = consumerAuthenticationInformation;

    const processingInformation = new cybersourceRestApi.Ptsv2paymentsProcessingInformation();
    processingInformation.capture = false;
    // processingInformation.profile = "AB4F294B-4EE9-4650-986D-E434073B9824";
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
		orderInformationBillTo.address1 = 'Ciudad Guatemala';
		orderInformationBillTo.locality = 'Guatemala';
		orderInformationBillTo.administrativeArea = 'CA';
		orderInformationBillTo.postalCode = '01001';
		orderInformationBillTo.country = 'GT';
		orderInformationBillTo.email = 'null@cybersource.com';
		orderInformationBillTo.phoneNumber = '4158880000';
		orderInformation.billTo = orderInformationBillTo
    requestObj.orderInformation = orderInformation;
    console.log('\nData : ', 2)
    console.log(fingerprintSessionId)
    const deviceInformation = new cybersourceRestApi.Ptsv2paymentsDeviceInformation();
    deviceInformation.fingerprintSessionId = fingerprintSessionId;
		requestObj.deviceInformation = deviceInformation;

    console.log("[ REQUEST OBJECT ] > ", requestObj);
    const instance = new cybersourceRestApi.PaymentsApi(configObject, apiClient);
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

app.post('/createToken',_tokenFunctions.createToken);

app.post('/processPaymentTickets', protectRoute.protectRoute, simple_authorization_internet);
app.post("/payment/risk", protectRoute.protectRoute, setup_completion_with_card_number);
app.post("/payment/risk/authentication", protectRoute.protectRoute, enroll_with_pending_authentication);
  
app.listen(port, () => {
  console.log(`Servidor Express escuchando en el puerto ${port}`);
});
