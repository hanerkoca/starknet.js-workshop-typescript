import { hash, number,getChecksumAddress } from "starknet";
const pk = '0x019800ea6a9a73f94aee6a3d2edf018fc770443e90c7ba121e8303ec6b349279';
const adr="0x2fd23d9182193775423497fc0c472e156c57c69e4089a1967fb288a2d84e914";
// const ha = hash.keccakBn(pk);
// const hb = hash.starknetKeccak(pk);
const cs=getChecksumAddress(adr);
console.log(cs, "\n");
// console.log(number.toHex(hb))
