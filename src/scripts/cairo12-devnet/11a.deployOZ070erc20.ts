// deploy in devnet a contract that can be rejected.
// launch with npx ts-node src/scripts/cairo12-devnet/8.deployRejected.ts
// Coded with Starknet.js v5.19.0

import { constants, Provider, Contract, Account, json, shortString, RpcProvider, CallData, Calldata, transaction } from "starknet";
import fs from "fs";
import { accountTestnet2ArgentX1Address, accountTestnet2ArgentX1privateKey, TonyNode } from "../../A2priv/A2priv";
import { infuraKey, account4MainnetAddress, account4MainnetPrivateKey } from "../../A-MainPriv/mainPriv";



async function main() {
    // initialize Provider 
    // const provider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" });
    const provider = new Provider({ sequencer: { baseUrl: "http://127.0.0.1:5050" } });
    // const provider = new RpcProvider({ nodeUrl: "http://192.168.1.99:9545/rpc/v0.4" });

    // Check that communication with provider is OK
    const bl = await provider.getBlock('latest');
    console.log("Block =", bl.block_number);

    const privateKey0 = "0xe3e70682c2094cac629f6fbed82c07cd";
    const accountAddress0: string = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
    const account0 = new Account(provider, accountAddress0, privateKey0); // Cairo 0 account
    // initialize existing OZ070 account
    const privateKey = "0x987654321aabbccddeeff";
    const accountAddress: string = "0x06c9cb47e3bb345fcccbba0fc51bac5c706701523a20f203b11dbb66bd648612";
    console.log("addr=",BigInt(accountAddress));
    const accountOZ = new Account(provider, accountAddress, privateKey,"1"); // Cairo 1 account
    console.log('existing_ACCOUNT_ADDRESS=', accountAddress);
    console.log('existing account connected.\n');

    const compiledSierra = json.parse(fs.readFileSync("./compiledContracts/cairo220/erc20OZ070.sierra.json").toString("ascii"));
    const compiledCasm = json.parse(fs.readFileSync("./compiledContracts/cairo220/erc20OZ070.casm.json").toString("ascii"));

    const erc20CallData: CallData = new CallData(compiledSierra.abi);
    const ERC20ConstructorCallData: Calldata = erc20CallData.compile("constructor", {
        name: "niceToken",
        symbol: "NIT",
        initial_supply: 50_000_000_000,
        recipient: accountOZ.address,
    });
    const response = await accountOZ.declareAndDeploy({ 
        contract: compiledSierra, 
        casm: compiledCasm , 
        constructorCalldata: ERC20ConstructorCallData
    });
    const contractClassHash = response.declare.class_hash;
    const contractAddress=response.deploy.address;
    // const contractClassHash = "0x2321632187052128273944a589784df34f286852c032be7d96981d30749834c";
    console.log('✅ ERC20 Contract declared with classHash =', contractClassHash);
    console.log("ERC20 contract_address =", contractAddress);
    await provider.waitForTransaction(response.deploy.transaction_hash);

    const contractNITerc20=new Contract(compiledSierra.abi,contractAddress,provider); // Cairo v2.2.0 OpenZeppelin erc20 contract
    const transaction1=contractNITerc20.populate("approve",{
        spender: accountAddress0,
        amount: 1000
    });
    const transaction2=contractNITerc20.populate("approve",{
        spender: accountAddress0,
        amount: 2000
    });
    const th=await accountOZ.execute([transaction1,transaction2]);
    await provider.waitForTransaction(th.transaction_hash);

    console.log("✅ Test completed.");

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });