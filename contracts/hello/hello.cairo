// cairo 2.0.0
#[starknet::interface]
trait IHelloContract<TContractState> {
    fn Say_HelloPhil126(ref self: TContractState, message: felt252);
}
#[starknet::contract]
mod HelloStarknet {
    use starknet::get_caller_address;
    use starknet::ContractAddress;
    use debug::PrintTrait;

    #[storage]
    struct Storage {}

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Hello: Hello, 
    }

    #[derive(Drop, starknet::Event)]
    struct Hello {
        #[key]
        from: ContractAddress,
        value: felt252
    }

    #[external(v0)]
    impl HelloContract of super::IHelloContract<ContractState> {
        fn Say_HelloPhil126(ref self: ContractState, message: felt252) {
            let caller = get_caller_address();
            self.emit(Hello { from: caller, value: message }); // event

            'Hello, Philippe!'.print();
            123.print();
            message.print();
        }
    }
}
