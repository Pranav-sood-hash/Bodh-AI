import CryptoJS from 'crypto-js';

const KEY = CryptoJS.enc.Utf8.parse(process.env.ENCRYPTION_KEY || 'bodhai_default_key_32chars_here!');
const IV = CryptoJS.enc.Utf8.parse(process.env.ENCRYPTION_IV || 'bodhai_iv_16char');

export const encrypt = (plain: string): string => {
  return CryptoJS.AES.encrypt(plain, KEY, {
    iv: IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
};

export const decrypt = (encrypted: string): string => {
  const bytes = CryptoJS.AES.decrypt(encrypted, KEY, {
    iv: IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const keyPreview = (plain: string): string => {
  if (plain.length < 10) return '****';
  return plain.slice(0, 6) + '...' + plain.slice(-4);
};
