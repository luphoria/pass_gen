const prompt = require("prompt-sync")();
const entropy = require("tai-password-strength");

let alphabet =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()-=_+`~;:[{]}\\|'\",<.>/? ";
let expectedStrength = 450;
alphabet = alphabet.split("");

let satisfied = false;

while (!satisfied) {
  let length = prompt(
    "what length password would you like to generate? (RECOMMEND: 70): "
  );

  length = Math.abs(parseInt(length));

  if (isNaN(length)) {
    console.log(
      "that's not a number!\npersonally, i like the number 70, though, so let's go with that."
    );
    length = 70;
  }

  let newPassword = "";

  for (let i = 0; i < length; i++)
    newPassword += alphabet[Math.floor(Math.random() * alphabet.length)];

  console.log("\n\n=========== PASSWORD ===========");
  console.log(newPassword);
  console.log("================================");

  // console.log(zxcvbn(newPassword))
  let strength = new entropy.PasswordStrength()
    .addTrigraphMap(entropy.trigraphs)
    .check(newPassword).trigraphEntropyBits;

  if (strength > expectedStrength) {
    console.log(
      `\n\nthis password is very strong, with an entropy score of ${strength}!\n\n\n${newPassword}`
    );
    satisfied = true;
  } else {
    let tryAgain = prompt(
      `\n\nthis password does not meet the strength expectation of ${expectedStrength}. instead it is ${strength}.\nwould you like to generate another? (y/n): `
    );
    if (tryAgain.toLowerCase() == "y")
      console.log("okay, generating another!\n");
    else if (tryAgain.toLowerCase() == "n") {
      console.log("okay.. see ya.");
      satisfied = true;
    } else console.log("i'm gonna take that as a YES.\n");
  }
}
