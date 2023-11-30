// Invoke a contract with a complex input
// launch with npx ts-node src/scripts/cairo12/cairo12-testnet/5.ComplexInvoke.ts
// Coded with Starknet.js v5.24.0

import { Account, ec, json, hash, CallData, RpcProvider, Contract, cairo, stark, RawArgsObject, BigNumberish, Uint256, Call } from "starknet";
import { account2TestnetAddress, account2TestnetPrivateKey } from "../../../A1priv/A1priv";


async function main() {
    // local network Pathfinder on Testnet with rpc 0.5.0
    const provider = new RpcProvider({ nodeUrl: "http://192.168.1.44:9545/rpc/v0.5" });
    console.log("Provider connected.");

    // testnet
    const privateKey0 = account2TestnetPrivateKey;
    const account0Address = account2TestnetAddress;

    const account0 = new Account(provider, account0Address, privateKey0);
    console.log('AX account connected.\n');

    // const classH = "0x067105de45f8bf5f43f9f9fcc09146655edd0e2034914f2f22fe87875524cea8";
    const contractAddress = "0x03b044f4beaccd1ed7ebd18f7d6c672f5e076325a3562294c1148d7de2f7e3c3";
    const contractSierra = await provider.getClassAt(contractAddress);
    const myContract = new Contract(contractSierra.abi, contractAddress, provider);
    const adminAddr = account0.address;

    // ClaimAmountDetails Cairo struct
    // struct ClaimAmountDetails {
    //     maxClaimable: u256, //fixed claimable amount
    //     totalClaimAmount: u256 //Total claim amount
    // }

    type ClaimAmountDetails = {
        maxClaimable: Uint256, //fixed claimable amount
        totalClaimAmount: Uint256 //Total claim amount
    }

    const myClaimAmountDetails: ClaimAmountDetails = {
        maxClaimable: cairo.uint256(5000),
        totalClaimAmount: cairo.uint256(100)
    }

    // ClaimSetting Cairo struct
    // struct ClaimSettings {
    //     name: felt252,  // Claim name
    //     creatorAddress: ContractAddress, //Address of claim creator
    //     walletAddress: ContractAddress, //Address of Safe/EOA
    //     airdropToken: ContractAddress, //Address of token to airdrop
    //     daoToken: ContractAddress, //Address of DAO token
    //     tokenGatingValue: u256, //Minimum amount required for token gating
    //     startTime: u64, //Start time of claim
    //     endTime: u64, //End time of claim
    //     cooldownTime: u64, //Time period after which users can receive tokens
    //     hasAllowanceMechanism: bool, //To check if token transfer is based on allowance
    //     isEnabled: bool, //To check if claim is enabled or not
    //     permission: felt252, // 1 : TokenGated , 2: Whitelisted, 3: FreeForAll, 4: Prorata
    //     claimAmountDetails: ClaimAmountDetails
    // } 

    type ClaimSettings = {
        name: BigNumberish,  // Claim name
        creatorAddress: BigNumberish, //Address of claim creator
        walletAddress: BigNumberish, //Address of Safe/EOA
        airdropToken: BigNumberish, //Address of token to airdrop
        daoToken: BigNumberish, //Address of DAO token
        tokenGatingValue: Uint256, //Minimum amount required for token gating
        startTime: BigNumberish, //Start time of claim
        endTime: BigNumberish, //End time of claim
        cooldownTime: BigNumberish, //Time period after which users can receive tokens
        hasAllowanceMechanism: boolean, //To check if token transfer is based on allowance
        isEnabled: boolean, //To check if claim is enabled or not
        permission: BigNumberish, // 1 : TokenGated , 2: Whitelisted, 3: FreeForAll, 4: Prorata
        claimAmountDetails: ClaimAmountDetails
    }

    const myClaimSettings: ClaimSettings = {
        name: "Zorg",
        creatorAddress: "0x123abc",
        walletAddress: "0x123abc",
        airdropToken: "0x123abc",
        daoToken: "0x123abc",
        tokenGatingValue: cairo.uint256(400),
        startTime: 123456,
        endTime: 234567,
        cooldownTime: 700,
        hasAllowanceMechanism: false,
        isEnabled: true,
        permission: 2,
        claimAmountDetails: myClaimAmountDetails
    }

    // WhiteListedUser cairo struct
    // {
    //     "name": "dropx::helper::Helper::WhitelistedUser",
    //         "type": "struct",
    //             "members": [
    //                 {
    //                     "name": "user",
    //                     "type": "core::starknet::contract_address::ContractAddress"
    //                 },
    //                 {
    //                     "name": "max_claimable_amount",
    //                     "type": "core::integer::u256"
    //                 }
    //             ]
    // }

    type WhiteListedUser = {
        user: BigNumberish,
        max_claimable_amount: Uint256
    }

    const user1: WhiteListedUser = {
        user: account0.address,
        max_claimable_amount: cairo.uint256(10000)
    }
    const user2: WhiteListedUser = {
        user: "0x777aaa",
        max_claimable_amount: cairo.uint256(20000)
    }

    // function to call:
    // {
    //     "name": "create_airdrop",
    //     "type": "function",
    //     "inputs": [
    //       {
    //         "name": "admin",
    //         "type": "core::starknet::contract_address::ContractAddress"
    //       },
    //       {
    //         "name": "claimSettings",
    //         "type": "dropx::helper::Helper::ClaimSettings"
    //       },
    //       {
    //         "name": "_whitelisted_user",
    //         "type": "core::array::Array::<dropx::helper::Helper::WhitelistedUser>"
    //       }
    //     ],
    //     "outputs": [
    //       {
    //         "type": "(core::starknet::contract_address::ContractAddress, core::starknet::contract_address::ContractAddress)"
    //       }
    //     ],
    //     "state_mutability": "external"
    //   },

    // console.log("abi=",myContract.abi);
    
    const myData: RawArgsObject = {
        admin: adminAddr,
        claimSettings: myClaimSettings,
        _whitelisted_user: [user1, user2]
    }
    console.log("myData =",myData);

    const myCall: Call = myContract.populate("create_airdrop", myData);
    console.log("Calldata =",myCall.calldata);

    const resp=account0.execute(myCall);
    const txResp=provider.waitForTransaction((await resp).transaction_hash);

    console.log("✅ Test completed.");
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });