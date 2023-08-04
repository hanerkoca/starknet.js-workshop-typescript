import {ec, hash, num, json, Contract, encode, BigNumberish, WeierstrassSignatureType } from "starknet";

const privateKey = "0x1234567890987654321";
const starknetPublicKey = ec.starkCurve.getStarkKey(privateKey);
const fullPublicKey = encode.addHexPrefix( encode.buf2hex( ec.starkCurve.getPublicKey( privateKey, false)));

const message: BigNumberish[] = [1, 128, 18, 14];

const msgHash = hash.computeHashOnElements(message);
const signature: WeierstrassSignatureType = ec.starkCurve.sign(msgHash,privateKey);


console.log(message, msgHash, signature);