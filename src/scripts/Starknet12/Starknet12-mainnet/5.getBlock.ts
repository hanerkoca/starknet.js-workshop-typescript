import { GetBlockResponse, RpcProvider } from 'starknet'
import { Provider, Account, Contract, ec, json, number, stark, Calldata } from "starknet";
import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {


    //let old_block: GetBlockResponse;
    const providerRPC = new RpcProvider({ nodeUrl: "http://192.168.1.99:9545/rpc/v0.4" });

    function getBlock(){
        providerRPC.getBlock('latest')
        .then((resp) => {
            const blockn = resp.block_number;
            console.log(blockn)
        })
        .catch((e)=>{console.log("Err :",e)})
    }

    setInterval(
        getBlock,
        3000
    );
    await new Promise(f => setTimeout(f, 11000));

    //setInterval(function () { callFunction() }, 10000)
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

