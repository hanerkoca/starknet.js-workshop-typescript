// import { addHexPrefix, removeHexPrefix } from './encode';
// import { isHex } from './number';
import { encode, number } from "starknet";

export function isASCII(str: string) {
    // eslint-disable-next-line no-control-regex
    return /^[\x00-\x7F]*$/.test(str);
}

// function to check if string has less or equal 31 characters
export function isShortString(str: string) {
    return str.length <= 31;
}

// function to check if string is a decimal
export function isDecimalString(decim: string): boolean {
    return /^[0-9]*$/i.test(decim);
}

export function encodeShortString(str: string): string {
    if (!isASCII(str)) throw new Error(`${str} is not an ASCII string`);
    if (!isShortString(str)) throw new Error(`${str} is too long`);
    return encode.addHexPrefix(str.replace(/./g, (char) => char.charCodeAt(0).toString(16)));
}

export function decodeShortString(str: string): string {
    if (!isASCII(str)) throw new Error(`${str} is not an ASCII string`);
    if (number.isHex(str)) {
        return encode.removeHexPrefix(str).replace(/.{2}/g, (hex) => String.fromCharCode(parseInt(hex, 16)));
    }
    if (isDecimalString(str)) {
        return decodeShortString('0X'.concat(BigInt(str).toString(16)));
    }
    throw new Error(`${str} is not Hex or decimal`);
}

async function main() {
    const test1 = decodeShortString("0x7572692f706963742f7433382e6a7067");
    console.log("test1 =", test1);
    const test2 = decodeShortString("156113730760229877043789998731456835687");
    console.log("test2 =", test2);
    const test3 = decodeShortString("azer456835687");
    console.log("test3 =", test3);


}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });