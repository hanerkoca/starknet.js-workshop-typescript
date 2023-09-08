// test in testnet2/rpc0.4.0 a contract that can be rejected.
// launch with npx ts-node src/scripts/cairo11-testnet2/6a.Rejected.ts
// Coded with Starknet.js v5.19.0

import { constants, Provider, Contract, Account, json, shortString, RpcProvider, encode, BlockTag } from "starknet";
import fs from "fs";
// import { account1Testnet2ArgentXAddress, account1Testnet2ArgentXprivateKey, TonyNode } from "../../A2priv/A2priv";
import { account2TestnetAddress, account2TestnetPrivateKey } from "../../A1priv/A1priv";
import { infuraKey, alchemyKey, blastKey,lavaMainnetKey } from "../../A-MainPriv/mainPriv";

async function main() {

    // *** Mainnet ***
    const provider = new RpcProvider({ nodeUrl: "https://g.w.lavanet.xyz:443/gateway/strk/rpc-http/"+lavaMainnetKey});
    // const provider = new RpcProvider({ nodeUrl: 'https://starknet-mainnet.g.alchemy.com/v2/' + alchemyKey });

    const id=await provider.getChainId();
    const blockNum = await provider.getBlock(BlockTag.latest);
    console.log("chain =",id,"\nBlock# =", blockNum.block_number);
    console.log("chain =",shortString.decodeShortString(id));
    const txR=await provider.getTransactionReceipt("0x7aa061a3babade36d9bc24ddd31083866c995feade1f1bf435ac536598374a7");
    console.log(txR);

    console.log("✅ Test completed.");


}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

    /**
     curl -X POST -H "Content-Type: application/json" https://g.w.lavanet.xyz:443/gateway/strk/rpc-http/85c501d84aff9f4b405d1eadaaf42955 --data '{"jsonrpc":"2.0","method":"starknet_getTransactionReceipt","params":["0x7aa061a3babade36d9bc24ddd31083866c995feade1f1bf435ac536598374a7"],"id":1}'
{"jsonrpc":"2.0","id":1,"result":{"type":"INVOKE","transaction_hash":"0x7aa061a3babade36d9bc24ddd31083866c995feade1f1bf435ac536598374a7","actual_fee":"0x61759362bc40","status":"ACCEPTED_ON_L2","block_hash":"0x459e37780782d6cd314ac35b2e27cfe4205846001b1a1ae03353c297fe5ed65","block_number":181774,"messages_sent":[],"events":[{"from_address":"0x454f0bd015e730e5adbb4f080b075fdbf55654ff41ee336203aa2e1ac4d4309","keys":["0x38fb7b2e3c9c2e712beb3f0810da51cfd22c24f931002cf7b8fe9ec042de50c"],"data":["0x4466738624e8c7db700c85ecc5c1a98787d76a732c31ac413c1e13bfd557b04","0x6a6b73706840676d61696c2e636f6d","0x41143b44f44f44f44f"]},{"from_address":"0x4466738624e8c7db700c85ecc5c1a98787d76a732c31ac413c1e13bfd557b04","keys":["0x5ad857f66a5b55f1301ff1ed7e098ac6d4433148f0b72ebc4a2945ab85ad53"],"data":["0x7aa061a3babade36d9bc24ddd31083866c995feade1f1bf435ac536598374a7","0x0"]},{"from_address":"0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7","keys":["0x99cd8bde557814842a3121e8ddfd433a539b8c9f14bf31ebf108d12e6196e9"],"data":["0x4466738624e8c7db700c85ecc5c1a98787d76a732c31ac413c1e13bfd557b04","0x1176a1bd84444c89232ec27754698e5d2e7e1a7f1539f12027f28b23ec9f3d8","0x61759362bc40","0x0"]}]}}
     */