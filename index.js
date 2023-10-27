const express = require('express');
const cors = require('cors');
const cybersourceRestApi = require('cybersource-rest-client');

const Configuration = require('./Configuration');
const protectRoute = require('./middleware/protectionRouter')
const _tokenFunctions = require('./middleware/_tokenFunctions')

const app = express();
const port = process.env.PORT || 3005;
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
      fingerprintSessionId,
      referenceId,
      email,
      whatsapp,
      department,
      address,
      name,
      postalCode
    } = _req.body;
    console.log(totalAmount)
    const nameSplit = name.split(" ");
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
		orderInformationBillTo.firstName = nameSplit[0] ? nameSplit[0] : " ";
		orderInformationBillTo.lastName = nameSplit[1] ? nameSplit[1] : " ";
		orderInformationBillTo.address1 = address;
		orderInformationBillTo.locality = department;
		orderInformationBillTo.postalCode = postalCode;
		orderInformationBillTo.country = 'GT';
		orderInformationBillTo.email = email;
		orderInformationBillTo.phoneNumber = whatsapp;
		orderInformation.billTo = orderInformationBillTo
		requestObj.orderInformation = orderInformation;

		const paymentInformation = new cybersourceRestApi.Riskv1authenticationsetupsPaymentInformation();
		const paymentInformationCard = new cybersourceRestApi.Riskv1authenticationsetupsPaymentInformationCard();
		if (numberCard.match(/4/g)) {
      paymentInformationCard.type = '001';
    } else if (numberCard.match(/5/g)) {
      paymentInformationCard.type = '002';
    }
		paymentInformationCard.expirationMonth = expirationMonth;
		paymentInformationCard.expirationYear = expirationYear;
		paymentInformationCard.number = numberCard;
		paymentInformation.card = paymentInformationCard;
    
    requestObj.paymentInformation = paymentInformation;

    const consumerAuthenticationInformation = new cybersourceRestApi.Riskv1decisionsConsumerAuthenticationInformation();
		consumerAuthenticationInformation.returnUrl = 'https://appfee-5a08db13047a.herokuapp.com/payment/risk/authentication/result';
    consumerAuthenticationInformation.referenceId = referenceId;
    consumerAuthenticationInformation.transactionMode = 'S';
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
        // write_log_audit(JSON.parse(error.response.text));
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

const validate_authentication_results = (_req, res) => {
  try {
    const {
      TransactionId,
      MD
    } = _req.body;
    console.log("[AUTH BODY] >>>", _req.body)
    const dataMD = MD.split("|")
		const configObject = new Configuration();
		const apiClient = new cybersourceRestApi.ApiClient();
		const requestObj = new cybersourceRestApi.ValidateRequest();

		const clientReferenceInformation = new cybersourceRestApi.Riskv1decisionsClientReferenceInformation();
		clientReferenceInformation.code = '3dsValidate';
		requestObj.clientReferenceInformation = clientReferenceInformation;

		const orderInformation = new cybersourceRestApi.Riskv1authenticationresultsOrderInformation();
		const orderInformationAmountDetails = new cybersourceRestApi.Riskv1authenticationsOrderInformationAmountDetails();
		orderInformationAmountDetails.currency = 'GTQ';
		orderInformationAmountDetails.totalAmount = dataMD[0];
		orderInformation.amountDetails = orderInformationAmountDetails;

		requestObj.orderInformation = orderInformation;

		const paymentInformation = new cybersourceRestApi.Riskv1authenticationresultsPaymentInformation();
		const paymentInformationCard = new cybersourceRestApi.Riskv1authenticationresultsPaymentInformationCard();
		if (dataMD[1].match(/4/g)) {
      paymentInformationCard.type = '001';
    } else if (dataMD[1].match(/5/g)) {
      paymentInformationCard.type = '002';
    }
		paymentInformationCard.expirationMonth = dataMD[2];
		paymentInformationCard.expirationYear = dataMD[3];
		paymentInformationCard.number = dataMD[1];
		paymentInformation.card = paymentInformationCard;

		requestObj.paymentInformation = paymentInformation;

		const consumerAuthenticationInformation = new cybersourceRestApi.Riskv1authenticationresultsConsumerAuthenticationInformation();
		consumerAuthenticationInformation.authenticationTransactionId = TransactionId;
		requestObj.consumerAuthenticationInformation = consumerAuthenticationInformation;


		const instance = new cybersourceRestApi.PayerAuthenticationApi(configObject, apiClient);

		instance.validateAuthenticationResults( requestObj, function (error, data, response) {
      if(error) {
				console.log('\nError : ' + JSON.stringify(error));
			}
			else if (data) {
				console.log('\nData : ' + JSON.stringify(data));
			}

      const responseData = {
        text: 'response3DS',
        totalAmount: dataMD[0],
        card: dataMD[1],
        expirationMonth: dataMD[2],
        expirationYear: dataMD[3],
        securityCode: dataMD[4],
        transactionId: dataMD[5],
        whatsapp: dataMD[6],
        email: dataMD[7],
        nit: dataMD[8],
        name: dataMD[9],
        trv: dataMD[10],
        trc: dataMD[11],
        priceTrv: dataMD[12],
        priceTrc: dataMD[13],
        department: dataMD[14],
        address: dataMD[15],
        postalCode: dataMD[16],
        nameCard: dataMD[17],
        data,
        error
      };
      console.log(data)
      if (data.status === "AUTHENTICATION_SUCCESSFUL") {
        res.set('Content-Type', 'text/html')
        res.status(200).send(Buffer.from(`<!DOCTYPE html>
        <html>
        <head>
          <meta charset='utf-8'>
          <meta http-equiv='X-UA-Compatible' content='IE=edge'>
          <meta name='viewport' content='width=device-width, initial-scale=1'>
        </head>
        <body>
          <h1>AUTENTUCACION COMPLETA</h1>
        </body>
        <script>
          window.onload = function() {
            window.parent.postMessage(${JSON.stringify(responseData)}, 'https://tickets.fincaelespinero.com')
          }
        </script>
        </html>`))
      } else {
        res.set('Content-Type', 'text/html')
        res.status(200).send(Buffer.from(`<!DOCTYPE html>
        <html>
        <head>
          <meta charset='utf-8'>
          <meta http-equiv='X-UA-Compatible' content='IE=edge'>
          <meta name='viewport' content='width=device-width, initial-scale=1'>
        </head>
        <body>
          <h1>ALGO SALIO MAL CON LA AUTENTICACION</h1>
        </body>
        <script>
          window.onload = function() {
            window.parent.postMessage(${JSON.stringify(responseData)}, 'https://tickets.fincaelespinero.com')
          }
        </script>
        </html>`))
      }
    });
    console.log('\nData : ', 5)
  } catch (error) {
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
    // clientReferenceInformationPartner.developerId = '7891234';
    // clientReferenceInformationPartner.solutionId = '89012345';
    clientReferenceInformation.partner = clientReferenceInformationPartner;

    requestObj.clientReferenceInformation = clientReferenceInformation;

    const paymentInformation = new cybersourceRestApi.Riskv1authenticationsetupsPaymentInformation();
    const paymentInformationCard = new cybersourceRestApi.Riskv1authenticationsetupsPaymentInformationCard();
    if (numberCard.match(/4/g)) {
      paymentInformationCard.type = '001';
    } else if (numberCard.match(/5/g)) {
      paymentInformationCard.type = '002';
    }
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
        // write_log_audit(JSON.parse(error.response.text));
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
      department,
      address,
      name,
      postalCode,
      email,
      whatsapp
    } = _req.body;
    const nameSplit = name.split(" ");

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
		orderInformationBillTo.firstName = nameSplit[0] ? nameSplit[0] : " ";
		orderInformationBillTo.lastName = nameSplit[1] ? nameSplit[1] : " ";
		orderInformationBillTo.address1 = address;
		orderInformationBillTo.locality = department;
		orderInformationBillTo.postalCode = postalCode;
		orderInformationBillTo.country = 'GT';
    orderInformationBillTo.email = email;
		orderInformationBillTo.phoneNumber = whatsapp;
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
      console.log("Datos finales", response)
      dataArray.push({ datos: JSON.stringify(response) });
    });
    console.log('\nData : ', 5)

    console.log('\nData 6 : ', dataArray)
    await esperarXSegundos(3);
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
app.post("/payment/risk/authentication/result", validate_authentication_results);
  
app.listen(port, () => {
  console.log(`Servidor Express escuchando en el puerto ${port}`);
});
