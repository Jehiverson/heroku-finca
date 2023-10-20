'use strict';

/*
* Merchant configuration properties are taken from Configuration module
*/

// common parameters
const MerchantId = 'visanetgt_elespinero';
const AuthenticationType = 'http_signature';
const MerchantKeyId = '33f00546-3ca5-4aa9-8ff3-09eb9308a3af';
const MerchantSecretKey = 'q/3IR2fY+SJJTwyXFHvBWSyhqS94MIE6iZuRz1tmgFY=';
const RunEnvironment = 'api.cybersource.com';
// const MerchantKeyId = '90701d38-c032-4c21-8ff4-0fd847abc7a0';
// const MerchantSecretKey = 'Pbpct3FyldbJkP1YcSW6icMZmbmuJ84NqiMgUE0DrZ8=';
// const RunEnvironment = 'apitest.cybersource.com';

// logging parameters
const EnableLog = true;
const LogFileName = 'cybs';
const LogDirectory = 'log';
const LogfileMaxSize = '5242880'; // 10 MB In Bytes
const EnableMasking = true;

// Class for Configuration
class Configuration {
    constructor() {
        this.authenticationType = AuthenticationType;
        this.runEnvironment = RunEnvironment;
        this.merchantID = MerchantId;
        this.merchantKeyId = MerchantKeyId;
        this.merchantsecretKey = MerchantSecretKey;
        this.logConfiguration = {
            enableLog: EnableLog,
            logFileName: LogFileName,
            logDirectory: LogDirectory,
            logFileMaxSize: LogfileMaxSize,
            loggingLevel: 'debug',
            enableMasking: EnableMasking
        };
    }
}

module.exports = Configuration;
