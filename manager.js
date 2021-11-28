const prompt = require("prompt-sync")();
const entropy = require("tai-password-strength");
const file = require("fs");

try {
  file.readFileSync("passwords.json");
} catch {
  console.log("passwords.json doesn't seem to exist! creating...");
  file.writeFileSync("passwords.json", "{}");
}

let passwords = JSON.parse(file.readFileSync("passwords.json"));
let chooseAction = "";

while (
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

let newPassword;

if (chooseAction === "g") {
  let satisfied = false;
  let expectedStrength = 450;
  let alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()-=_+`~;:[{]}\\|'\",<.>/? ".split(
      ""
    );

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

    newPassword = "";

    for (let i = 0; i < length; i++)
      newPassword += alphabet[Math.floor(Math.random() * alphabet.length)];

    console.log("\n\n=========== PASSWORD ===========");
    console.log(newPassword);
    console.log("================================");

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
        console.log("okay..");
        satisfied = true;
      } else console.log("i'm gonna take that as a YES.\n");
    }
  }
} else if (chooseAction === "s") {
  newPassword = prompt("okay, what's the password?: ");
} else if (chooseAction === "d") {
  console.log("ok!");
  console.log("current saved passwords:\n");
  Object.keys(passwords).forEach((p) => console.log(p));
  console.log(
    "\n===== WARNING =====\ndeleting any of these entries makes your password IRRECOVERABLE!\nproceed with caution!"
  );
  let toDelete = prompt(
    "which entry would you like to remove?: "
  ).toUpperCase();
  if (passwords[toDelete]) {
    confirmation = prompt(
      "are you sure you would like to delete the entry " +
        toDelete +
        '? it will NOT be recoverable.\nif so, type the following EXACTLY: "Yes, make this password irrecoverable!": '
    );
    if (confirmation == "Yes, make this password irrecoverable!") {
      delete passwords[toDelete];
      console.log("done!");
    } else {
      console.log(
        'you did not input precisely: "Yes, make this password irrecoverable!"\naborting...'
      );
    }
  } else {
    console.log("this entry does not exist!\naborting...");
  }
  file.writeFileSync("passwords.json", JSON.stringify(passwords));
  process.exit(1);
} else {
  let satisfied = false;
  while (!satisfied) {
    console.log("current saved passwords:\n");
    Object.keys(passwords).forEach((p) => console.log(p));
    let showPass = prompt(
      "\nwhich of these passwords would you like to view?: "
    ).toUpperCase();
    if (passwords[showPass]) {
      console.log("ok!");
      console.log(passwords[showPass]);
    } else {
      console.log("that password..doesn't exist.");
    }
    confirmation = prompt("would you like to view another? (y/n): ");
    if (confirmation.toLowerCase() === "n") {
      console.log("ok!");
      satisfied = true;
    } else {
      console.log("assuming (y)es...");
    }
  }
  process.exit(1);
}

let savePass = prompt("would you like to save this password? (y/n): ");
if (savePass.toLowerCase() === "y") {
  console.log("current saved passwords:\n");
  Object.keys(passwords).forEach((p) => console.log(p));
  let passwordName = prompt(
    "\nwhat service is this password gonna be tied to?: "
  ).toUpperCase();
  if (passwords[passwordName]) {
    confirmation = prompt(
      "that password already exists!\nwould you like to overwrite the existing password? (y/n): "
    );
    if (confirmation != "y") {
      console.log("assuming that's a no!");
    } else {
      console.log("ok!");
      passwords[passwordName] = newPassword;
    }
  } else {
    console.log("ok!");
    passwords[passwordName] = newPassword;
  }
  file.writeFileSync("passwords.json", JSON.stringify(passwords));
} else {
  console.log("assuming (n)o, see ya later!");
}
