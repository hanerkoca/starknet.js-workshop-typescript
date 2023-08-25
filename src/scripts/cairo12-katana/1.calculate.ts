// declare & deploy a Cairov2.1.0 contract with Span.
// use Starknet.js v5.17, Katana v0.1.0
// launch with npx ts-node src/scripts/cairo13-devnet/3.deployTestSpan.ts

import { Provider, RpcProvider, Account, Contract, json, constants, GetTransactionReceiptResponse, InvokeFunctionResponse ,ec,CallData,Calldata, hash} from "starknet";
import fs from "fs";
import { accountTestnet4privateKey, accountTestnet4Address } from "../../A1priv/A1priv"
import * as dotenv from "dotenv";
import { resetDevnetNow } from "../resetDevnetFunc";
dotenv.config();

//          👇👇👇
// 🚨🚨🚨   Launch katana --accounts 3 --seed 0 --gas-price 250
//          👆👆👆


async function main() {
    //initialize Provider 
    const provider = new RpcProvider({ nodeUrl: 'http://0.0.0.0:5050' });
    console.log('✅ Connected to Katana devnet.');

    // resetDevnetNow();
    // initialize existing predeployed account 0 of Devnet
    const privateKey = "0x300001800000000300000180000000000030000000000003006001800006600";
    const accountAddress: string = "0x3ee9e18edc71a6df30ac3aca2e0b02a198fbce19b7480a63a0d71cbd76652e0";
    const pubKey="0x1b7b37a580d91bc3ad4f9933ed61f3a395e0e51c9dd5553323b8ca3942bb44e";
    const account0 = new Account(provider, accountAddress, privateKey);
    console.log('✅ Predeployed account connected\nOZ_ACCOUNT_ADDRESS=', account0.address);

    const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
    console.log("pmubkeycalc =",starkKeyPub);

    // declare  Cairo 2.0.0 account contract
    const compiledC20SierraAccount = json.parse(
        fs.readFileSync("./compiledContracts/cairo200/account200.sierra.json").toString("ascii")
    );
    const compiledC20CasmAccount = json.parse(
        fs.readFileSync("./compiledContracts/cairo200/account200.casm.json").toString("ascii")
    );
    const { transaction_hash: declTH, class_hash: decCH } = await account0.declare({ contract: compiledC20SierraAccount, casm: compiledC20CasmAccount });
    console.log('Cairo 2.0.0 Starkware account class hash =', decCH);
    await provider.waitForTransaction(declTH);

    // Calculate future address of the account
    const accountCallData: CallData = new CallData(compiledC20SierraAccount.abi);
    const accountConstructorCallData: Calldata = accountCallData.compile("constructor", [starkKeyPub]);
    const C20contractAddress = hash.calculateContractAddressFromHash(starkKeyPub, decCH, accountConstructorCallData, 0);
    console.log('Precalculated account address=', C20contractAddress);


    // Declare & deploy Test contract in devnet
    // const compiledSierra = json.parse(fs.readFileSync("./compiledContracts/cairo210/hello_res_events_newTypes.sierra.json").toString("ascii"));
    // const compiledCasm = json.parse(fs.readFileSync("./compiledContracts/cairo210/hello_res_events_newTypes.casm.json").toString("ascii"));

    // const declareResponse = await account0.declare({ contract: compiledSierra, casm: compiledCasm });
    // const contractClassHash = declareResponse.class_hash;
    // console.log('✅ Test Contract declared with classHash =', contractClassHash);
    // // class hash = 0x67ddb84fdae809b18d7759127a246e674787132ef89f15f5d6e42dd0cfc92a1

    // await provider.waitForTransaction(declareResponse.transaction_hash);
    // console.log("Deployement in progress...");

    // const { transaction_hash: th2, address } = await account0.deployContract({ classHash: contractClassHash, constructorCalldata: [] });
    // console.log("contract_address =", address);
    // await provider.waitForTransaction(th2);

    // // Connect the new contract instance :

    // const myTestContract = new Contract(compiledSierra.abi, address, provider);
    // myTestContract.connect(account0);
    // console.log('✅ Test Contract connected at =', myTestContract.address);
    console.log("✅ Test ended");
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });