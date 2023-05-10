import CryptoJS from 'crypto-js';

const readfile = (file) => {
  return new Promise((resolve, reject) => {
    var fr = new FileReader();
    fr.onload = () => {
      resolve(fr.result)
    };
    fr.readAsArrayBuffer(file);
  });
}

const encryptfile = async (uploadedPdf_) => {
  var plaintextbytes = await readfile(uploadedPdf_)
    .catch(function (err) {
      console.error(err);
    });
  var plaintextbytes = new Uint8Array(plaintextbytes);

  var pbkdf2iterations = 10000;
  var txtEncpassphrase = CryptoJS.enc.Hex.parse('0123456789abcdef0123456789abcdef');
  var passphrasebytes = new TextEncoder("utf-8").encode(txtEncpassphrase);
  var pbkdf2salt = window.crypto.getRandomValues(new Uint8Array(8));

  var passphrasekey = await window.crypto.subtle.importKey('raw', passphrasebytes, { name: 'PBKDF2' }, false, ['deriveBits'])
    .catch(function (err) {
      console.error(err);
    });

  var pbkdf2bytes = await window.crypto.subtle.deriveBits({ "name": 'PBKDF2', "salt": pbkdf2salt, "iterations": pbkdf2iterations, "hash": 'SHA-256' }, passphrasekey, 384)
    .catch(function (err) {
      console.error(err);
    });
  pbkdf2bytes = new Uint8Array(pbkdf2bytes);

  var keybytes = pbkdf2bytes.slice(0, 32);
  var ivbytes = pbkdf2bytes.slice(32);

  var key = await window.crypto.subtle.importKey('raw', keybytes, { name: 'AES-CBC', length: 256 }, false, ['encrypt'])
    .catch(function (err) {
      console.error(err);
    });

  var cipherbytes = await window.crypto.subtle.encrypt({ name: "AES-CBC", iv: ivbytes }, key, plaintextbytes)
    .catch(function (err) {
      console.error(err);
    });

  cipherbytes = new Uint8Array(cipherbytes);

  var resultbytes = new Uint8Array(cipherbytes.length + 16)
  resultbytes.set(new TextEncoder("utf-8").encode('Salted__'));
  resultbytes.set(pbkdf2salt, 8);
  resultbytes.set(cipherbytes, 16);

  var blob = new Blob([resultbytes], { type: 'application/pdf' });
  return blob;
}

export default encryptfile;