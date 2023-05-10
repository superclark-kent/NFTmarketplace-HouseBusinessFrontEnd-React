import CryptoJS from 'crypto-js';

const decryptfile = async (_file_) => {
  var cipherbytes = new Uint8Array(_file_);
  var txtEncpassphrase = CryptoJS.enc.Hex.parse('0123456789abcdef0123456789abcdef');

  var pbkdf2iterations = 10000;
  var passphrasebytes = new TextEncoder("utf-8").encode(txtEncpassphrase);
  var pbkdf2salt = cipherbytes.slice(8, 16);

  var passphrasekey = await window.crypto.subtle.importKey('raw', passphrasebytes, { name: 'PBKDF2' }, false, ['deriveBits'])
    .catch(function (err) {
      console.error('passphrasekey err', err);

    });

  var pbkdf2bytes = await window.crypto.subtle.deriveBits({ "name": 'PBKDF2', "salt": pbkdf2salt, "iterations": pbkdf2iterations, "hash": 'SHA-256' }, passphrasekey, 384)
    .catch(function (err) {
      console.error('pbkdf2bytes err', err);
    });
  pbkdf2bytes = new Uint8Array(pbkdf2bytes);

  var keybytes = pbkdf2bytes.slice(0, 32);
  var ivbytes = pbkdf2bytes.slice(32);
  var cipherbytes = cipherbytes.slice(16);

  var key = await window.crypto.subtle.importKey('raw', keybytes, { name: 'AES-CBC', length: 256 }, false, ['decrypt'])
    .catch(function (err) {
      console.error('key err', err);
    });

  var plaintextbytes = await window.crypto.subtle.decrypt({ name: "AES-CBC", iv: ivbytes }, key, cipherbytes)
    .catch(function (err) {
      console.log('plaintextbytes err', err);
    });

  plaintextbytes = new Uint8Array(plaintextbytes);

  var blob = new Blob([plaintextbytes], { type: 'application/pdf' });
  var blobUrl = URL.createObjectURL(blob);
  return blobUrl;
}

export default decryptfile;