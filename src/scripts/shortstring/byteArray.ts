import { BigNumberish, shortString, num } from "starknet";

type ByteArray = {
    data: BigNumberish[];
    pending_word: BigNumberish;
    pending_word_len: BigNumberish;
}

export function stringFromByteArray(myByteArray: ByteArray): string {
    const pending_word: string = BigInt(myByteArray.pending_word) === 0n ? '' : shortString.decodeShortString(num.toHex(myByteArray.pending_word));
    return myByteArray.data.reduce<string>(
        (cumuledString, encodedString: BigNumberish) => {
            const add: string = BigInt(encodedString) === 0n ? '' : shortString.decodeShortString(num.toHex(encodedString));
            return cumuledString + add
        }
        , ""
    ) + pending_word;
}

export function byteArrayFromStr(str: string): ByteArray {
    if (str.length === 0) {
        return {
            data: ['0x00'],
            pending_word: '0x00',
            pending_word_len: 0
        } as ByteArray
    }
    const myShortStrings: string[] = shortString.splitLongString(str);
    const remains: string = myShortStrings[myShortStrings.length - 1];
    const myShortStringsEncoded: BigNumberish[] = myShortStrings.map(
        (shortStr) => shortString.encodeShortString(shortStr)
    );
    if (remains.length === 31) {
        return {
            data: myShortStringsEncoded,
            pending_word: '0x00',
            pending_word_len: 0
        } as ByteArray
    }
    const pendingEncodedWord: BigNumberish = myShortStringsEncoded.pop()!;
    return {
        data: myShortStringsEncoded.length === 0 ? ["0x00"] : myShortStringsEncoded,
        pending_word: pendingEncodedWord,
        pending_word_len: remains.length
    } as ByteArray
}

// "ABCDEFGHIJKLMNOPQRSTUVWXYZ12345AAADEFGHIJKLMNOPQRSTUVWXYZ12345A"
const message = "ABCDEFGHIJKLMNOPQRSTUVWXYZ12345AAADEFGHIJKLMNOPQRSTUVWXYZ12345A";
const myByteArray = byteArrayFromStr(message);
console.log("string =", message)
console.log("result", myByteArray);

console.log("Array of Chunks:", myByteArray.data);
console.log("Array len:", myByteArray.data.length);
console.log("Pending Word:", myByteArray.pending_word);
console.log("Pending Word len:", myByteArray.pending_word_len);

// Starknet serialized input:
const serialized = [
    myByteArray.data.length,
    ...myByteArray.data,
    myByteArray.pending_word,
    myByteArray.pending_word_len,
];
console.log("serialized =", serialized);
const result = stringFromByteArray(myByteArray);
console.log("revert calculation = >"+result+"<");

