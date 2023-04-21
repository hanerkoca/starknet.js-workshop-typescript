// declare & deploy a Cairo 1 contract.
// use of OZ deployer
// launch with npx ts-node src/scripts/cairo11-devnet/4b.declareDeployHello.ts

import { Provider, Account, Contract,  json,constants} from "starknet";
import { accountTestnet2ArgentX1Address,accountTestnet2ArgentX1privateKey } from "../../A2priv/A2priv";

import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();


async function main() {
     //initialize Provider 
     const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI2 } });
     console.log('✅ Connected to testnet2.');
 
     // initialize existing predeployed account 0 of Devnet
     const accountAddress: string = accountTestnet2ArgentX1Address;
     const privateKey=accountTestnet2ArgentX1privateKey;
      const account0 = new Account(provider, accountAddress, privateKey);
     console.log('✅ Deployed account 1 of testnet2 =', account0.address);
     console.log('ACCOUNT_PRIVATE_KEY=', privateKey);
 
    // Declare & deploy Test contract in devnet
    const compiledHelloSierra = json.parse(fs.readFileSync("./compiledContracts/test_type3.sierra").toString("ascii"));
    const compiledHelloCasm = json.parse(fs.readFileSync("./compiledContracts/test_type3.casm").toString("ascii"));
    const deployResponse = await account0.declareAndDeploy({ contract: compiledHelloSierra, casm: compiledHelloCasm, salt: "0" });

    const contractClassHash = deployResponse.declare.class_hash;
    console.log('✅ Test Contract declared with classHash =', contractClassHash);

    console.log("contract_address =", deployResponse.deploy.contract_address);
    await provider.waitForTransaction(deployResponse.deploy.transaction_hash);

    // Connect the new contract instance :
    const myTestContract = new Contract(compiledHelloSierra.abi, deployResponse.deploy.contract_address, provider);
    console.log('✅ Test Contract connected at =', myTestContract.address);

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// classHash = 0x28b6f2ee9ae00d55a32072d939a55a6eb522974a283880f3c73a64c2f9fd6d6
// address = 0x771bbe2ba64fa5ab52f0c142b4296fc67460a3a2372b4cdce752c620e3e8194