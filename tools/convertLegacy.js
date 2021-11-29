// A program to quickly convert an existing password list to an XOR-encoded version (required in current version.)
const file = require("fs")
const prompt = require("prompt-sync")();
const _ = require("underscore");

(function (exports) {
  "use strict";

  let XORCipher = {
    encode: function (key, data) {
      data = xor_encrypt(key, data);
      return b64_encode(data);
    },
    decode: function (key, data) {
      data = b64_decode(data);
      return xor_decrypt(key, data);
    },
  };

  let b64_table =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

  function b64_encode(data) {
    let o1,
      o2,
      o3,
      h1,
      h2,
      h3,
      h4,
      bits,
      r,
      i = 0,
      enc = "";
    if (!data) {
      return data;
    }
    do {
      o1 = data[i++];
      o2 = data[i++];
      o3 = data[i++];
      bits = (o1 << 16) | (o2 << 8) | o3;
      h1 = (bits >> 18) & 0x3f;
      h2 = (bits >> 12) & 0x3f;
      h3 = (bits >> 6) & 0x3f;
      h4 = bits & 0x3f;
      enc +=
        b64_table.charAt(h1) +
        b64_table.charAt(h2) +
        b64_table.charAt(h3) +
        b64_table.charAt(h4);
    } while (i < data.length);
    r = data.length % 3;
    return (r ? enc.slice(0, r - 3) : enc) + "===".slice(r || 3);
  }

  function b64_decode(data) {
    let o1,
      o2,
      o3,
      h1,
      h2,
      h3,
      h4,
      bits,
      i = 0,
      result = [];
    if (!data) {
      return data;
    }
    data += "";
    do {
      h1 = b64_table.indexOf(data.charAt(i++));
      h2 = b64_table.indexOf(data.charAt(i++));
      h3 = b64_table.indexOf(data.charAt(i++));
      h4 = b64_table.indexOf(data.charAt(i++));
      bits = (h1 << 18) | (h2 << 12) | (h3 << 6) | h4;
      o1 = (bits >> 16) & 0xff;
      o2 = (bits >> 8) & 0xff;
      o3 = bits & 0xff;
      result.push(o1);
      if (h3 !== 64) {
        result.push(o2);
        if (h4 !== 64) {
          result.push(o3);
        }
      }
    } while (i < data.length);
    return result;
  }

  function keyCharAt(key, i) {
    return key.charCodeAt(Math.floor(i % key.length));
  }

  function xor_encrypt(key, data) {
    return _.map(data, (c, i) => {
      return c.charCodeAt(0) ^ keyCharAt(key, i);
    });
  }

  function xor_decrypt(key, data) {
    return _.map(data, (c, i) => {
      return String.fromCharCode(c ^ keyCharAt(key, i));
    }).join("");
  }

  exports.XORCipher = XORCipher;
})(this);

console.log("Looking for legacy (plaintext-password) JSON file in ./passwords.json...")
try {
    file.readFileSync("../passwords.json");
} catch {
    console.error("Could not find/read passwords.json!\nQuitting...")
    process.exit(1)
}
console.log("OK")

let passwords = JSON.parse(file.readFileSync("../passwords.json"));
console.log("What should your master password be?\nWARNING: this password will NOT be indexed in the password manager! You MUST remember this yourself!")
let XORKey    = prompt("Enter master password (XOR key): ")
console.log("XOR Key: " + XORKey)
console.log("Are you ABSOLUTELY SURE this is the correct master password? If it is not, your passwords WILL NOT be recoverable!")
let confirm = prompt("To confirm, type exactly \"Yes, please encrypt all my data with my key '" + XORKey + "'!\": ")
if(confirm != `Yes, please encrypt all my data with my key '${XORKey}'!`) {
    console.error("You did not pass the correct string.\naborting...")
    process.exit(1)
}

Object.keys(passwords).forEach((p) => {
    passwords[p] = this.XORCipher.encode(XORKey,passwords[p])
})

console.log("\n\nDONE!")
console.log("writing over passwords.json...")
file.writeFileSync("../passwords.json", JSON.stringify(passwords));
console.log("finished!\n\nWRITE THIS PASSWORD DOWN AS YOU NEED IT TO VIEW PASSWORDS:\n" + XORKey)
