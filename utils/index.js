const bcrypt = require("bcrypt");

function isObjectEmpty(obj = {}) {
  return !Object.keys(obj).length;
}

function rejectObjEmpty(obj = {}) {
  return isObjectEmpty(obj) ? null : obj;
}

function generateOTP(otp_length = 6) {
  let digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < otp_length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

function getSecondBetween2Date(d1, d2) {
  return (new Date(d2).getTime() - new Date(d1).getTime()) / 1000;
}
async function createHash(password) {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(password, salt);
}

function randomStr(_length = 8) {
  let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let pw = "";

  for (let i = 0; i <= _length; i++) {
    let randomNumber = Math.floor(Math.random() * chars.length);
    pw += chars.substring(randomNumber, randomNumber + 1);
  }

  return pw;
}

const prepareRate = ({ name, code, price, currency, description }) => ({
  "service_name": name,
  "description": description,
  "service_code": `asc-${code}-la`,
  "total_price": price * 100,
  "currency": currency,
})

/** 
 * Method for removing object properties
 *
 */
const removeProps = function (obj, props) {
  for (const prop of props) {
    if (obj.hasOwnProperty(prop)) {
      delete obj[prop];
    }
  }
};

module.exports = {
  isObjectEmpty,
  rejectObjEmpty,
  generateOTP,
  getSecondBetween2Date,
  randomStr,
  removeProps,
  createHash,
  prepareRate
};
