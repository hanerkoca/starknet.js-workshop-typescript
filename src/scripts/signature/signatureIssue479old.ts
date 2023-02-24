import { number, ec, hash, encode } from "starknet";

const ORDER = BigInt('0x800000000000011000000000000000000000000000000000000000000000001');
const hexes = Array.from({ length: 256 }, (v, i) => i.toString(16).padStart(2, '0'));

export function bytesToHex(bytes: Uint8Array): string {
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
        hex += hexes[bytes[i]];
    }
    return hex;
}
// Calculates a modulo b
export function mod(a: bigint, b: bigint): bigint {
    const result = a % b;
    return result >= 0n ? result : b + result;
}

function neg(num: bigint) { return mod(-num, ORDER) }

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
        //if (!u8a(a)) throw new Error('Uint8Array expected');
        r.set(a, pad);
        pad += a.length;
    });
    return r;
}


//isOdd: (num) => (num & _1n) === _1n;

const handleVerify = (privKey: string) => {
    const keyPair = ec.getKeyPair(privKey);
    const starknetPubKey: string = ec.getStarkKey(keyPair); // 256 bits
    const starknetPubKeyBi: bigint = BigInt(starknetPubKey);
    // const isXodd = (starknetPubKeyBi & 1n) === 1n;
    // const prefix = isXodd ? "03" : "02";
    const fullPubKey = encode.addHexPrefix(keyPair.getPublic("hex")); // 512 bits
    const isYodd = (BigInt(fullPubKey) & 1n) === 1n;
    const prefix = isYodd ? "03" : "02";
    // Starknet should provide prefix in their public keys, like this :
    const adaptedstark: string = prefix + encode.removeHexPrefix(starknetPubKey);
    // but in real life, it's missing.
    // So we willl have 2 solutions.
    // One of these solutions shoud succeed to verify the message.

    const encodedMessage = hash.starknetKeccak("abc123").toString("hex");
    const signature = ec.sign(keyPair, encodedMessage);

    // const bnPoint = ec.ec.curve.pointFromX(number.toBN(starknetPubKey));
    // const xp = bnPoint.x;
    // const xpHex = xp.toString(16);
    // const yp = bnPoint.y;
    // const ypHex = yp.toString(16);

    // const u8aPubKey: Uint8Array = bnPoint._encode(false); //true = 256bits false=512 bits
    // const hexPubKey: string = encode.addHexPrefix(bytesToHex(u8aPubKey));

    const myPoint1 = ec.ec.curve.decodePoint("02" + encode.removeHexPrefix(starknetPubKey), "hex");
    const myPoint2 = ec.ec.curve.decodePoint("03" + encode.removeHexPrefix(starknetPubKey), "hex");
    // console.log("decode=", myPoint);
    const coord1: Uint8Array = myPoint1._encode(false);
    const coord2: Uint8Array = myPoint2._encode(false);
    const pubKey1: string = encode.addHexPrefix(bytesToHex(coord1));
    const pubKey2: string = encode.addHexPrefix(bytesToHex(coord2));


    // const head: Uint8Array = coord.slice(0, 1);
    // const arrayX = coord.slice(1, 33);
    // const arrayY = coord.slice(33);
    // const hexX: string = encode.addHexPrefix(bytesToHex(arrayX));
    // const hexY: string = encode.addHexPrefix(bytesToHex(arrayY));
    // const biY: bigint = BigInt(hexY);
    // const isY2odd = (biY & 1n) === 1n;
    // const negHexYbi: bigint = neg(BigInt(hexY));
    // const negHexY: string = "0" + negHexYbi.toString(16);
    // const negYbytes: Uint8Array = hexToBytes(negHexY);
    // let resultPubKey: string;
    // if ((isY2odd === isYodd)) {
    //     resultPubKey = encode.addHexPrefix(bytesToHex(concatBytes(head, arrayX, arrayY))); // y is odd
    // } else {
    //     resultPubKey = encode.addHexPrefix(bytesToHex(concatBytes(head, arrayX, negYbytes))); // y is even

    // }
    // console.log("hexX    =", hexX);
    // console.log("hexY    =", hexY);
    // console.log("negHexY =", negHexY);

    //const hexcoord: string = encode.addHexPrefix(resultPubKey);

    const inferredKeyPair1 = ec.getKeyPairFromPublicKey(pubKey1);
    const isVerified1 = ec.verify(inferredKeyPair1, encodedMessage, signature);
    const inferredKeyPair2 = ec.getKeyPairFromPublicKey(pubKey2);
    const isVerified2 = ec.verify(inferredKeyPair2, encodedMessage, signature);
    const verifiedMessage = isVerified1 || isVerified2;

    console.log("priv: ", privKey);
    console.log("fullpub: ", fullPubKey);
    console.log("calcpub1: ", pubKey1);
    console.log("calcpub1: ", pubKey2);
    console.log("strkPub: ", starknetPubKey, adaptedstark);
    console.log("successfully verified: ", verifiedMessage);
    console.log("===========================");
}

// const handleVerify2 = (privKey) => { }

const main = async () => {
    const myPrivKey2 = "0x5b7d4f8710b3581ebb2b8b74efaa23d25ab0ffea2a4f3e269bf91bf9f63d633";
    handleVerify(myPrivKey2);
    // example of a private key that works
    const privKeyA = "0xc9e7ce3142d57bbbc0c8a7c9b59d11d31811177aa1b9cc027e522a975632a606";

    // example of a private key that fails
    const privKeyB = "0x2fc52cc9f1107c94473eba3f2560799131371c76a002f55cac1c6aa5293cb5f0";
    handleVerify(privKeyB);
    handleVerify(privKeyA);
    const myPrivKey = "0x5b7d4f8710b3581ebb2b8b74efaa23d25ab0ffea2a4f3e269bf91bf9f63d634";
    handleVerify(myPrivKey);
}

main()



