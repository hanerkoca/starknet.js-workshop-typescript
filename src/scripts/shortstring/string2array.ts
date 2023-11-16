// convert a long string to an array of ASCII numbers.
// launch with npx ts-node src/scripts/shortstring/string2array.ts
// coded with Starknet.js v5.21.0

const text="Azerty uiopQsdfghjkl";
const arrayOfAscii:number[]=Array.from(text).map(ch=>ch.charCodeAt(0));
console.log(arrayOfAscii);
const finalText:string=String.fromCharCode(...arrayOfAscii);
console.log(finalText);

