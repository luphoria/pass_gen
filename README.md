# pass_gen
A simple offline CLI password manager written in node.js.
## Installation
pass_gen is not a plugin or extension, though rather simply a manager for a plain-text .json file. Due to this, installation is very simple:
```
git clone https://github.com/luphoria/pass_gen
cd pass_gen
npm i
```
## Usage
To run the program, (while in the project's root directory), run the command `node manager`.

You should be greeted with a prompt. Simply follow the instructions it gives you.

All of your user data is in `passwords.json`. This should go without saying, but don't share this with anyone.

All password entries are automatically forced to ALL-UPPERCASE. All inputs from the user will automatically be treated according to what the code wants -- in other words, it's cASe iNsENsiTiVE!
### Credits
luphoria - wrote everything

`tai-password-strength` - https://www.npmjs.com/package/tai-password-strength
