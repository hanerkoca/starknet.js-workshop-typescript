// Deploy a new braavos wallet.
// use Starknet.js v5.11.1, starknet-devnet 0.5.2
// launch with npx ts-node src/scripts/braavos/2.createNewBraavosAccount.ts

import { Provider, Account, ec, json, stark, hash, constants, CallData, num } from "starknet";
import { accountBraavosDevnet6Address, accountBraavosDevnet6privateKey } from "../../A1priv/A1priv";
import fs from "fs";
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();


async function main() {
    //          👇👇👇
    // 🚨🚨🚨   Launch 'starknet-devnet --seed 0 --fork-network alpha-goerli' before using this script.
    //          👆👆👆

    //initialize Provider 
    const providerDevnet = new Provider({ sequencer: { baseUrl: "http://127.0.0.1:5050" } });

    const privateKeyAccount0 = "0xe3e70682c2094cac629f6fbed82c07cd";
    const account0Address: string = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
    const account0 = new Account(providerDevnet, account0Address, privateKeyAccount0);
    console.log('predeployed devnet account0 connected.\n');



    // Use Proxy and Braavosaccount in devnet :
    const BraavosProxyClassHash = "0x03131fa018d520a037686ce3efddeab8f28895662f019ca3ca18a626650f7d1e";
    const BraavosImplementationClassHash = "0x5aa23d5bb71ddaa783da7ea79d405315bafa7cf0387a74f4593578c3e9e6570"; // used 30/may/2023, deployed on Testnet 1&2 & Mainnet 17/nov/2022, automatically replaced by 0x02c2b8...
    // const BraavosAccountClassHash = "0x2c2b8f559e1221468140ad7b2352b1a5be32660d0bf1a3ae3a054a4ec5254e4"; //  deployed on Testnet 1&2  26/march/2023, Mainnet 04/apr/2023, automatically replace 0x5aa23...
    // const BraavosAccountClassHash = "0x69577e6756a99b584b5d1ce8e60650ae33b6e2b13541783458268f07da6b38a"; // old, deployed on Testnet 1 & Mainnet 12/juil/2022, Testnet 2 28/oct/2022, automatically replaced by 0x02c2b8...

    // Calculate future address of the Braavos account
    const privateKeyBraavos = accountBraavosDevnet6privateKey;
    console.log('Braavos_ACCOUNT_PRIVATE_KEY=', privateKeyBraavos);
    const starkKeyPubBraavos = ec.starkCurve.getStarkKey(privateKeyBraavos);
    console.log('Braavos_ACCOUNT_PUBLIC_KEY=', starkKeyPubBraavos);
    const BraavosImplementationInitializer = CallData.compile({
        signer: starkKeyPubBraavos,
    })
    console.log("Implementation Initializer =", BraavosImplementationInitializer);
    const BraavosProxyConstructorCallData = CallData.compile({
        implementation_address: BraavosImplementationClassHash,
        initializer_selector: hash.getSelectorFromName("initializer"),
        calldata: [...BraavosImplementationInitializer,]
    });
    console.log("constructor for proxy =", BraavosProxyConstructorCallData);
    const BraavosProxyAddress = hash.calculateContractAddressFromHash(
        starkKeyPubBraavos,
        BraavosProxyClassHash,
        BraavosProxyConstructorCallData,
        0);
    console.log('Precalculated account address=', BraavosProxyAddress);
    console.log('Stored account address       =', num.cleanHex(accountBraavosDevnet6Address));

    if (num.cleanHex(accountBraavosDevnet6Address) === BraavosProxyAddress) {
        // fund account address before account creation       
        const { data: answer } = await axios.post('http://127.0.0.1:5050/mint', { "address": BraavosProxyAddress, "amount": 10_000_000_000_000_000_000, "lite": true }, { headers: { "Content-Type": "application/json" } });
        console.log('Answer mint =', answer); //50 ETH

        // deploy Braavos account
        const accountBraavos = new Account(providerDevnet, BraavosProxyAddress, privateKeyBraavos);
        const deployAccountPayload = {
            classHash: BraavosProxyClassHash,
            constructorCalldata: BraavosProxyConstructorCallData,
            contractAddress: BraavosProxyAddress,
            addressSalt: starkKeyPubBraavos
        };
        const { transaction_hash, contract_address: BraavosAccountFinalAddress } = await accountBraavos.deployAccount(deployAccountPayload);
        console.log('Transaction hash =', transaction_hash);
        await providerDevnet.waitForTransaction(transaction_hash);
        console.log('✅ Braavos wallet deployed.');
    } else {
        throw Error("Wrong address!");
    }
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });