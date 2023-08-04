//Cairo 2.1.0 

use array::ArrayTrait;
use core::starknet::eth_address::EthAddress;
use core::starknet::class_hash::ClassHash;
use starknet::ContractAddress;


#[starknet::interface]
trait ITestContract<TContractState> {
    fn increase_counter(ref self: TContractState, amount: u128);
    fn decrease_counter(ref self: TContractState, amount: u128);
    fn get_counter(self: @TContractState) -> u128;
    fn iReceive(
        self: @TContractState,
        _currentValset: ValsetArgs,
        _sigs: Array<u256>,
        requestPayload: RequestPayload,
        relayerRouterAddress: felt252
    );
    fn iReceive2(self: @TContractState, ch: ClassHash, sp: Span<u16>);
    
}

#[derive(Copy, Drop, Serde)]
struct ValsetArgs {
    validators: Span<EthAddress>,
    powers: Span<u64>,
    valsetNonce: u256,
}

#[derive(Drop, Serde)]
struct RequestPayload {
    routeAmount: u256,
    requestIdentifier: u256,
    requestTimestamp: u256,
    srcChainId: felt252,
    routeRecipient: ContractAddress,
    destChainId: felt252,
    asmAddress: ContractAddress,
    requestSender: felt252,
    handlerAddress: ContractAddress,
    packet: Span<felt252>,
    isReadCall: bool,
}

//simple struct
#[derive(Copy, Drop, Serde)]
struct Order {
    p1: felt252,
    p2: u16,
}

#[derive(Drop, Serde, Append)]
enum MyEnum {
    Response: Order,
    Warning: felt252,
    Error: (u16, u16),
    Critical: Array<u32>,
    Empty: ()
}

// struct with enum
#[derive(Drop, Serde)]
struct OrderW {
    p1: felt252,
    my_enum: MyEnum,
    adds: Option<u8>,
}

#[starknet::contract]
mod MyTestContract {
    use starknet::ContractAddress;
    use starknet::contract_address_const;
    use array::ArrayTrait;
    use array::SpanTrait;
    use core::starknet::class_hash::ClassHash;

    use super::{Order, MyEnum, OrderW, ValsetArgs, RequestPayload};

    #[storage]
    struct Storage {
        counter: u128, 
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        CounterIncreased: CounterIncreased,
        CounterDecreased: CounterDecreased
    }

    #[derive(Drop, starknet::Event)]
    struct CounterIncreased {
        #[key]
        from: ContractAddress,
        amount: u128
    }

    #[derive(Drop, starknet::Event)]
    struct CounterDecreased {
        amount: u128
    }

    #[l1_handler]
    fn increase_bal(ref self: ContractState, from_address: felt252, amount: u128) {
        let current = self.counter.read();
        self.counter.write(current + amount);
    }


    #[constructor]
    fn constructor(ref self: ContractState, intial_value: u128) {
        self.counter.write(intial_value);
    }

    #[external(v0)]
    impl CounterContract of super::ITestContract<ContractState> {
        fn get_counter(self: @ContractState) -> u128 {
            self.counter.read()
        }

        fn increase_counter(ref self: ContractState, amount: u128) {
            let current = self.counter.read();
            self.counter.write(current + amount);
            self
                .emit(
                    CounterIncreased {
                        from: contract_address_const::<0x6c8fe36d7454901424063b5c1b949d7e347ce3872d2487b30b76f3a4fd7c219>(),
                        amount: amount
                    }
                );
        }

        fn decrease_counter(ref self: ContractState, amount: u128) {
            let current = self.counter.read();
            self.counter.write(current - amount);
            self.emit(CounterDecreased { amount });
        }

        fn iReceive(
            self: @ContractState,
            _currentValset: ValsetArgs,
            _sigs: Array<u256>,
            requestPayload: RequestPayload,
            relayerRouterAddress: felt252,
        ) {}

        fn iReceive2(self: @ContractState, ch: ClassHash, sp: Span<u16>) {}

    }  
}
