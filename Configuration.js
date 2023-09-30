'use strict';

/*
* Merchant configuration properties are taken from Configuration module
*/

// common parameters
const MerchantId = 'visanetgt_elespinero';
const MerchantKeyId = '90701d38-c032-4c21-8ff4-0fd847abc7a0';
const MerchantSecretKey = 'Pbpct3FyldbJkP1YcSW6icMZmbmuJ84NqiMgUE0DrZ8=';
const AuthenticationType = 'http_signature';
const RunEnvironment = 'apitest.cybersource.com';

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
