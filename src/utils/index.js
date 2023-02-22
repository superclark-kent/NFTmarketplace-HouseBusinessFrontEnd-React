import CryptoJS from 'crypto-js';
import { secretKey } from 'mainConfig';

export const decryptContract = (contract) => {
  var bytes = CryptoJS.AES.decrypt(contract.contractURI, secretKey);
  var decryptedData = bytes.toString(CryptoJS.enc.Utf8);
  var bytesCompany = CryptoJS.AES.decrypt(contract.companyName, secretKey);
  var decryptedCompany = bytesCompany.toString(CryptoJS.enc.Utf8);
  var bytesType = CryptoJS.AES.decrypt(contract.contractType, secretKey);
  var decryptedType = bytesType.toString(CryptoJS.enc.Utf8);
  var bytesCurrency = CryptoJS.AES.decrypt(contract.currency, secretKey);
  var decryptedCurrency = bytesCurrency.toString(CryptoJS.enc.Utf8);
  console.log(decryptedCompany, decryptedData, decryptedType);
  return {
    ...contract,
    contractURI: decryptedData,
    companyName: decryptedCompany,
    currency: decryptedCurrency,
    contractType: decryptedType,
  };
};
