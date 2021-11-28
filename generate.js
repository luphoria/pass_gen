const prompt = require("prompt-sync")()

let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()-=_+`~;:[{]}\\|'\",<.>/? "
alphabet = alphabet.split("")
let length = prompt("what length password would you like to generate? (RECOMMEND: 70): ")

length = Math.abs(parseInt(length))

if(isNaN(length)) {
    console.log("That's not a number!\nPersonally, I like the number 70, though, so let's go with that.")
    length = 70
}

let newPassword = ""

for(let i=0;i<length;i++)
    newPassword += alphabet[Math.floor(Math.random() * alphabet.length)]

console.log("\n\n=========== PASSWORD ===========")
console.log(newPassword)
console.log("================================")

// console.log(zxcvbn(newPassword))