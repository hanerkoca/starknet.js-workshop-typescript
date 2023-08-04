//Cairo 2.1.0rc4

#[starknet::interface]
trait ITestSignature<TContractState> {
    fn verify_signature(
        self: @TContractState,
        hash_message: felt252,
        stark_pub_key: felt252,
        signature: Array<felt252>
    ) -> bool;
}

#[starknet::contract]
mod MyTestSignature {
    use ecdsa::check_ecdsa_signature;
    use array::ArrayTrait;

    #[storage]
    struct Storage {
        counter: u128, 
    }

    #[external(v0)]
    impl ValidateSignature of super::ITestSignature<ContractState> {
        fn verify_signature(
            self: @ContractState,
            hash_message: felt252,
            stark_pub_key: felt252,
            signature: Array<felt252>
        ) -> bool {
            let sign = signature.span();
            check_ecdsa_signature(
                hash_message, stark_pub_key, *signature.at(0_u32), *signature.at(1_u32)
            )
        }
    }
}
