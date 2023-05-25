import CryptoJS from 'crypto-js';
import { secretKey } from 'mainConfig';

export const decryptContract = (contract) => {
  var bytes = CryptoJS.AES.decrypt(contract.contractURI, secretKey);
  var decryptedURI = bytes.toString(CryptoJS.enc.Utf8);
  var bytesCompany = CryptoJS.AES.decrypt(contract.companyName, secretKey);
  var decryptedCompany = bytesCompany.toString(CryptoJS.enc.Utf8);
  var bytesCurrency = CryptoJS.AES.decrypt(contract.currency, secretKey);
  var decryptedCurrency = bytesCurrency.toString(CryptoJS.enc.Utf8);
  return {
    ...contract,
    contractURI: decryptedURI,
    companyName: decryptedCompany,
    currency: decryptedCurrency
  };
};
