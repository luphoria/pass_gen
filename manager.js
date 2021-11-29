const prompt = require("prompt-sync")();
const entropy = require("tai-password-strength");
const file = require("fs");
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

const objAlpha = (obj) => {
  // Alphabetically sorts the JSON data
  let ordered = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      ordered[key] = obj[key];
    });
  return ordered;
};

try {
  // First-time run check
  file.readFileSync("passwords.json");
} catch {
  console.log("passwords.json doesn't seem to exist! creating...");
  file.writeFileSync("passwords.json", "{}");
}

const key = prompt("Enter XOR key to read passwords (YOU MUST REMEMBER THIS YOURSELF): ");

let passwords = objAlpha(JSON.parse(file.readFileSync("passwords.json")));

let chooseAction = ""; // whatever action the user wants to perform

while (
  // the user has to input a correct answer to proceed
  chooseAction.toLowerCase() != "v" &&
  chooseAction.toLowerCase() != "g" &&
  chooseAction.toLowerCase() != "s" &&
  chooseAction.toLowerCase() != "d"
) {
  chooseAction = prompt(
    "would you like to view your saved passwords (v), generate a new password (g), store an existing password/token (s), or delete a password (d)?: "
  );
  if (
    chooseAction.toLowerCase() != "v" &&
    chooseAction.toLowerCase() != "g" &&
    chooseAction.toLowerCase() != "s" &&
    chooseAction.toLowerCase() != "d"
  )
    console.log("invalid input! try again.");
}

let newPassword; // not all of the options use this, but i decided to put it in the main scope anyways.

if (chooseAction === "g") {
  // generate a new password
  let satisfied = false;
  let expectedStrength = 450; // entropy bits required to make it not scream at you
  let alphabet = prompt(
    // TODO include multiple default options like alphanumeric-only
    "Enter an alphabet or leave blank for default (ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()-=_+`~;:[{]}\\|'\",<.>/? ): "
  );
  if (alphabet == "")
    alphabet =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()-=_+`~;:[{]}\\|'\",<.>/? ";
  alphabet = alphabet.split(""); // turns alphabet from string into array

  while (!satisfied) {
    // until conditions are fulfilled
    let length = prompt(
      "what length password would you like to generate? (RECOMMEND: 70): "
    );

    length = Math.abs(parseInt(length));

    if (isNaN(length)) {
      console.log(
        "that's not a number!\npersonally, i like the number 70, though, so let's go with that."
      );
      length = 70; // we do a little trolling
    }

    newPassword = "";

    for (
      let i = 0;
      i < length;
      i++ // add a random character from the alphabet for every number in length
    )
      newPassword += alphabet[Math.floor(Math.random() * alphabet.length)];

    console.log("\n\n=========== PASSWORD ===========");
    console.log(newPassword);
    console.log("================================");

    let strength = new entropy.PasswordStrength()
      .addTrigraphMap(entropy.trigraphs)
      .check(newPassword).trigraphEntropyBits; // don't ask me how this is actually measured, just know the bigger number the better pwd

    if (strength > expectedStrength) {
      // strong password
      console.log(
        `\n\nthis password is very strong, with an entropy score of ${strength}!\n\n\n${newPassword}`
      );
      satisfied = true;
    } else {
      // not-strong-enough password
      console.log(
        `\n\nthis password does not meet the strength expectation of ${expectedStrength}. instead it is ${strength}.\n`
      );
      tryAgain = prompt("would you like to generate another? (y/n): "); // yes yes please do that
      if (tryAgain.toLowerCase() == "y")
        console.log("okay, generating another!\n");
      else if (tryAgain.toLowerCase() == "n") {
        console.log("okay..");
        satisfied = true;
      } else console.log("i'm gonna take that as a YES.\n"); // gnillort
    }
  }
} else if (chooseAction === "s") {
  // (s)et password
  newPassword = prompt("okay, what's the password?: ");
} else if (chooseAction === "d") {
  // (d)elete password
  console.log("ok!");
  console.log("current saved passwords:\n");
  Object.keys(passwords).forEach((p) => console.log(p)); // for every password indexed, list the name of the password
  console.log(
    "\n===== WARNING =====\ndeleting any of these entries makes your password IRRECOVERABLE!\nproceed with caution!"
  );
  let toDelete = prompt(
    "which entry would you like to remove?: "
  ).toUpperCase();
  if (passwords[toDelete]) {
    // if that password entry exists
    confirmation = prompt(
      "are you sure you would like to delete the entry " +
        toDelete +
        '? it will NOT be recoverable.\nif so, type the following EXACTLY: "Yes, make this password irrecoverable!": '
    );
    if (confirmation === "Yes, make this password irrecoverable!") {
      // passed challenge
      delete passwords[toDelete];
      console.log("done!");
    } else {
      // did not pass challenge
      console.log(
        'you did not input precisely: "Yes, make this password irrecoverable!"\naborting...'
      );
    }
  } else {
    // if password entry does not exist
    console.log("this entry does not exist!\naborting...");
  }
  file.writeFileSync("passwords.json", JSON.stringify(passwords)); //overwrite passwords.json
  process.exit(1);
} else {
  // (v)iew passwords
  let satisfied = false;
  while (!satisfied) {
    // until user decides they don't wanna read their pwds
    console.log("current saved passwords:\n");
    Object.keys(passwords).forEach((p) => console.log(p)); // for every password indexed, list the name of the password
    console.log("\n");
    let showPass = prompt(
      "which of these passwords would you like to view?: "
    ).toUpperCase();
    if (passwords[showPass]) {
      // if that password entry exists
      console.log("ok!");
      console.log(this.XORCipher.decode(key,passwords[showPass])); // just the password
    } else {
      // if that password entry does not exist
      console.log("that password..doesn't exist.");
    }
    confirmation = prompt("would you like to view another? (y/n): ");
    if (confirmation.toLowerCase() === "n") {
      console.log("ok!");
      satisfied = true;
    } else {
      // G-N-I-L-L-O-R-T
      console.log("assuming (y)es...");
    }
  }
  process.exit(1);
}

// i didn't wrap this in a case because multiple cases use it and it's a big hunk of code
let savePass = prompt("would you like to save this password? (y/n): ");
if (savePass.toLowerCase() === "y") {
  // save password
  console.log("current saved passwords:\n");
  Object.keys(passwords).forEach((p) => console.log(p)); // for every password indexed, list the name of the password
  console.log("\n");
  let passwordName = prompt(
    "what service is this password gonna be tied to?: "
  ).toUpperCase();
  if (passwords[passwordName]) {
    // ask if user wants to overwrite the existing data
    console.log("that password already exists!");
    confirmation = prompt(
      "would you like to overwrite the existing password? (y/n): "
    );
    if (confirmation != "y") {
      // idk why i wrote "not yes" but it's kinda funny so i'm keeping it
      console.log("assuming that's a no!");
    } else {
      console.log("ok!");
      passwords[passwordName] = this.XORCipher.encode(key,newPassword);
    }
  } else {
    // if there was no conflict
    console.log("ok!");
    passwords[passwordName] = this.XORCipher.encode(key,newPassword);
  }
  file.writeFileSync("passwords.json", JSON.stringify(passwords)); // overwrite passwords.json
} else {
  // user did not type `y`
  console.log("assuming (n)o, see ya later!");
}
