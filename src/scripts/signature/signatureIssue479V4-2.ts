import { ec, hash, encode, number } from "starknet";

const ORDER = BigInt('0x800000000000011000000000000000000000000000000000000000000000001');
const hexes = Array.from({ length: 256 }, (v, i) => i.toString(16).padStart(2, '0'));

export function bytesToHex(bytes: Uint8Array): string {
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
        hex += hexes[bytes[i]];
    }
    return hex;
}

export function hexToBytes(hex: string): Uint8Array {
    if (typeof hex !== 'string') throw new Error('hex string expected, got ' + typeof hex);
    if (hex.length % 2) throw new Error('hex string is invalid: unpadded ' + hex.length);
    const array = new Uint8Array(hex.length / 2);
    for (let i = 0; i < array.length; i++) {
        const j = i * 2;
        const hexByte = hex.slice(j, j + 2);
        const byte = Number.parseInt(hexByte, 16);
        if (Number.isNaN(byte) || byte < 0) throw new Error('invalid byte sequence');
        array[i] = byte;
    }
    return array;
}

// Copies several Uint8Arrays into one.
export function concatBytes(...arrs: Uint8Array[]): Uint8Array {
    const r = new Uint8Array(arrs.reduce((sum, a) => sum + a.length, 0));
    let pad = 0; // walk through each item, ensure they have proper type
    arrs.forEach((a) => {
        r.set(a, pad);
        pad += a.length;
    });
    return r;
}


const handleVerify = (privKey: string) => {
    const keyPair = ec.getKeyPair(privKey);
    const starknetPubKey: string = ec.getStarkKey(keyPair); // 256 bits
    const fullPubKey = encode.addHexPrefix(keyPair.getPublic("hex")); // 512 bits
    const isYodd = (BigInt(fullPubKey) & 1n) === 1n;
    const prefix = isYodd ? "03" : "02";
    // Starknet should provide prefix in their public keys, like this :
    const adaptedstark: string = prefix + encode.removeHexPrefix(starknetPubKey);
    // but in real life, it's missing.
    // The solution is the one with the higher Y coordinate.

    const encodedMessage = hash.starknetKeccak("abc123").toString("hex");
    const signature = ec.sign(keyPair, encodedMessage);

    const myPoint1 = ec.ec.curve.decodePoint("02" + encode.removeHexPrefix(starknetPubKey), "hex");
    const myPoint2 = ec.ec.curve.decodePoint("03" + encode.removeHexPrefix(starknetPubKey), "hex");
    const y1 = number.toHex(myPoint1.getY()); const y1bn = BigInt(y1);
    const y2 = number.toHex(myPoint2.getY()); const y2bn = BigInt(y2);
    let coord: Uint8Array;
    if (y1bn > y2bn) {
        coord = myPoint1._encode(false);
    } else {
        coord = myPoint2._encode(false);
    }
    const pubKey: string = encode.addHexPrefix(bytesToHex(coord));
    const inferredKeyPair = ec.getKeyPairFromPublicKey(pubKey);
    const isVerified = ec.verify(inferredKeyPair, encodedMessage, signature);

    console.log("priv: ", privKey);
    console.log("fullpub: ", fullPubKey);
    console.log("y1: ", y1);
    console.log("y2: ", y2);
    console.log("strkPub: ", starknetPubKey);
    console.log("y1>y2 =", y1 > y2);
    console.log("successfully verified: ", isVerified);
    console.log("===========================");
}

const main = async () => {
    const privKeyA = "0xc9e7ce3142d57bbbc0c8a7c9b59d11d31811177aa1b9cc027e522a975632a606";
    handleVerify(privKeyA);
    const privKeyB = "0x2fc52cc9f1107c94473eba3f2560799131371c76a002f55cac1c6aa5293cb5f0";
    handleVerify(privKeyB);
    const myPrivKey = "0x5b7d4f8710b3581ebb2b8b74efaa23d25ab0ffea2a4f3e269bf91bf9f63d634";
    handleVerify(myPrivKey);
    const myPrivKey2 = "0x5b7d4f8710b3581ebb2b8b74efaa23d25ab0ffea2a4f3e269bf91bf9f63d633";
    handleVerify(myPrivKey2);
    handleVerify("0xc9e7ce3142d57bbbc0c8a7c9b59d11d31811177aa1b9cc027e522a975632a606");
    handleVerify("0x5b7d4f8710b3581ebb2b8b74efaa23d2eab0ffea2a4f3e269bf91bf9f63d633");
    handleVerify("0x5b7d4f8710b35815bb2b8b74efaa23d25ab0ffea2a4f3e269bf91bf9f63d633");
    handleVerify("0x5b7d4f8710b3581ebb2b8b74efaa23d25ab02fea2a4f3e269bf91bf9f63d633");
    handleVerify("0x05b7d4ff63d635");
}

main()



