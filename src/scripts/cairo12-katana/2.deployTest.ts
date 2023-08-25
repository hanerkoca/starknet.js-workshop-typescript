// declare & deploy a Cairov2.1.0 contract with Span.
// use Starknet.js v5.17, starknet-devnet 0.5.5
// launch with npx ts-node src/scripts/cairo13-devnet/3.deployTestSpan.ts

import { Provider, RpcProvider, Account, Contract, json, constants, GetTransactionReceiptResponse, InvokeFunctionResponse, shortString, ec, encode } from "starknet";
import fs from "fs";
import { accountTestnet4privateKey, accountTestnet4Address } from "../../A1priv/A1priv"
import * as dotenv from "dotenv";
import { resetDevnetNow } from "../resetDevnetFunc";
dotenv.config();

//          👇👇👇
// 🚨🚨🚨   Launch : katana --accounts 3 --seed 0 --port 5001
//          👆👆👆


async function main() {
    //initialize Provider 
    const provider = new RpcProvider({ nodeUrl: 'http://0.0.0.0:5001' });
    console.log('✅ Connected to Katana devnet.');

    // resetDevnetNow();
    // initialize existing predeployed account 0 of Devnet
    const privateKey = "0x300001800000000300000180000000000030000000000003006001800006600";
    //const privateKey = "0x079c733b28fb8555cdffc3984d521df11c234ae7c7106ab56bdc175595511a64";
    const accountAddress: string = "0x3ee9e18edc71a6df30ac3aca2e0b02a198fbce19b7480a63a0d71cbd76652e0";
    const pubK = "0x1b7b37a580d91bc3ad4f9933ed61f3a395e0e51c9dd5553323b8ca3942bb44e";
    //const pubK = "0x6586e6776038bda0aa5a58ae0bf0debf59626abddbaad7af92396526e01cbe5";

    const account0 = new Account(provider, accountAddress, privateKey, "0");
    console.log('✅ Predeployed account connected\nOZ_ACCOUNT_ADDRESS=', account0.address);

    const chId = await provider.getChainId();
    console.log("chain id =", shortString.decodeShortString(chId));
    const accountcontractCH = await provider.getClassHashAt(accountAddress);
    const accountcontract = await provider.getClassAt(accountAddress);
    const accountContract2 = await provider.getClassByHash(accountcontractCH);
    console.log("ClassHash account =", accountcontractCH);
    // fs.writeFileSync('./accountContract.json', json.stringify(accountcontract, undefined, 2));
    // fs.writeFileSync('./accountContractCH.json', json.stringify(accountContract2, undefined, 2));
    const compiledAccountAbi = json.parse(fs.readFileSync("compiledContracts/cairo060/Account_0_6_1_abi.json").toString("ascii"));
    const myAccountContract = new Contract(compiledAccountAbi, accountAddress, provider);
    myAccountContract.connect(account0);
    const res1 = await myAccountContract.getPublicKey();
    console.log("pubKey from contract = 0x" + res1.publicKey.toString(16));
    // Declare & deploy Test contract in devnet
    const compiledSierra = json.parse(fs.readFileSync("./compiledContracts/cairo210/hello_res_events_newTypes.sierra.json").toString("ascii"));
    const compiledCasm = json.parse(fs.readFileSync("./compiledContracts/cairo210/hello_res_events_newTypes.casm.json").toString("ascii"));
    const nonce = await account0.getNonce();
    console.log("nonce =", nonce);
    const msgHash = "0x35ba2ab5d05cd48e760438341e9b6f2d05dbc7d1842104b91724d993b3e61a1";
    const res2 = await myAccountContract.isValidSignature(msgHash, ['0x7db07a0efe565d73246586c6e05a8cc9a28fc433f3434c424d5051c1c15a2d2', '0x75160c642b50775658b313dfba110300c5203f900d701c93990065778c28a29']);
    // const res2 = await myAccountContract.isValidSignature(msgHash, [58305781414811813910822436322716203844397183351016274693545010133635199090n,1008460282911861562060287573023180307713575270942446864283983351311853564605n]);

    console.log("isValidSignature =", res2);

    // change pubkey
    // const privKeyRandom = encode.buf2hex(ec.starkCurve.utils.randomPrivateKey());
    // const fullPubKey = encode.addHexPrefix(encode.buf2hex(ec.starkCurve.getPublicKey(privKeyRandom, false))); // complete
    // const starknetPubKey = ec.starkCurve.getStarkKey(privKeyRandom); // only X part
    // console.log("New pk\nPrivateK =", privKeyRandom)
    // console.log('fullpubKey    =', fullPubKey);
    // console.log('starknetPubKey= ', starknetPubKey);
    // const res3 = await myAccountContract.setPublicKey(starknetPubKey,{ maxFee: 900_000_000_000_000 });
    // console.log("res3 =",res3);

    const declareResponse = await account0.declare({ contract: compiledSierra, casm: compiledCasm }, { maxFee: 9_000_000_000_000_000 });
    const contractClassHash = declareResponse.class_hash;
    console.log('✅ Test Contract declared with classHash =', contractClassHash);
    // // class hash = 0x67ddb84fdae809b18d7759127a246e674787132ef89f15f5d6e42dd0cfc92a1

    await provider.waitForTransaction(declareResponse.transaction_hash);
    console.log("Deployement in progress...");

    const { transaction_hash: th2, address } = await account0.deployContract({ classHash: contractClassHash, constructorCalldata: [] }, { maxFee: 9_000_000_000_000_000 });
    console.log("contract_address =", address);
    await provider.waitForTransaction(th2);

    // Connect the new contract instance :

    const myTestContract = new Contract(compiledSierra.abi, address, provider);
    myTestContract.connect(account0);
    console.log('✅ Test Contract connected at =', myTestContract.address);

    const te1 = await myTestContract.array2d_felt([[1, 2], [11, 12], [21, 22]]);
    console.log("array2d_felt =", te1);

    console.log('✅ Test completed.');

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

/**
Transaction validation error: ValidateTransactionError(VirtualMachineExecutionErrorWithTrace 
    { trace: "Error in the called contract (0x03ee9e18edc71a6df30ac3aca2e0b02a198fbce19b7480a63a0d71cbd76652e0):\nError at pc=0:124:\n
    Signature 07db07a0efe565d73246586c6e05a8cc9a28fc433f3434c424d5051c1c15a2d2075160c642b50775658b313dfba110300c5203f900d701c93990065778c28a29, is invalid, 
    with respect to the public key 776884572420343368181498333840917808242507050656477246564607071348775957582, \n    
    and the message hash 339122082218739870951856348521351912850634443767090189673648833671858903128.\nCairo traceback (most recent call last):\nUnknown location (pc=0:615)\nUnknown location (pc=0:600)\nUnknown location (pc=0:245)\n", source: CairoRunError(VmException(VmException { pc: 124, inst_location: None, inner_exc: 
    Memory(
    InvalidSignature(("07db07a0efe565d73246586c6e05a8cc9a28fc433f3434c424d5051c1c15a2d2075160c642b50775658b313dfba110300c5203f900d701c93990065778c28a29", 
    776884572420343368181498333840917808242507050656477246564607071348775957582,
     339122082218739870951856348521351912850634443767090189673648833671858903128))
     ), error_attr_value: None, traceback: Some("Cairo traceback (most recent call last):\nUnknown location (pc=0:615)\nUnknown location (pc=0:600)\nUnknown location (pc=0:245)\n") })) })

     msgH='0x35ba2ab5d05cd48e760438341e9b6f2d05dbc7d1842104b91724d993b3e61a1'
     sig=3553182098349231661084774580740610728376459300688532272527642141827024659154n
recovery:
0
s:
3309972465073728156080405820882168423825776721561695109991458797528859970089n
sig : (2) ['0x7db07a0efe565d73246586c6e05a8cc9a28fc433f3434c424d5051c1c15a2d2', '0x75160c642b50775658b313dfba110300c5203f900d701c93990065778c28a29']

message

compiled_class_hash:
'0x55cbe5ccb966046458df4f6704fd6e70795d3a50d49699bbec9a42e42f2350c'
contract_class:
{sierra_program: Array(8439), contract_class_version: '0.1.0', entry_points_by_type: {…}, abi: '[{"type": "impl", "name": "IHelloStarknetImpl"…loStarknet::EventNested", "kind": "nested"}]}]'}
max_fee:
'0x0'
nonce:
'0x1'
sender_address:
'0x3ee9e18edc71a6df30ac3aca2e0b02a198fbce19b7480a63a0d71cbd76652e0'
signature:
(2) ['0x7db07a0efe565d73246586c6e05a8cc9a28fc433f3434c424d5051c1c15a2d2', '0x75160c642b50775658b313dfba110300c5203f900d701c93990065778c28a29']
0:
'0x7db07a0efe565d73246586c6e05a8cc9a28fc433f3434c424d5051c1c15a2d2'
1:
'0x75160c642b50775658b313dfba110300c5203f900d701c93990065778c28a29'
length:
2
[[Prototype]]:
Array(0)
[[Prototype]]:
Object
type:
'DECLARE'
version:
'0x100000000000000000000000000000002'
     */
