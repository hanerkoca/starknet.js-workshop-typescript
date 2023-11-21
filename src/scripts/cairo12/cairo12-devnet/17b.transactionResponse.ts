// Enum like for tx response
// launch with : npx ts-node src/scripts/cairo12/cairo12-devnet/17b.transactionResponse.ts
// Coded with Starknet.js v5.21.0

import { BigNumberish, GetTransactionReceiptResponse, RejectedTransactionReceiptResponse, RevertedTransactionReceiptResponse, SuccessfulTransactionReceiptResponse, TransactionExecutionStatus } from "starknet";

interface TransactionResponse {
    Success: SuccessfulTransactionReceiptResponse,
    Rejected: RejectedTransactionReceiptResponse,
    Reverted: RevertedTransactionReceiptResponse,
    Error: Error,
};
type TxVariants = keyof TransactionResponse;

type Rec = Record<string, any>;
type MatchAuthorizedFns<U extends Rec> = {
    [V in TxVariants]: ((f: U[V]) => any);
}
type MatchAuthorizedFnsDefault = Partial<MatchAuthorizedFns<TransactionResponse>> & { "_": () => any };

type TxRVariant = {
    readonly _status: TxVariants,
    readonly _content?: TransactionResponse[TxVariants],
    match(handlerFns: MatchAuthorizedFns<TransactionResponse> | MatchAuthorizedFnsDefault): any;
    isSuccess: () => boolean,
    isRejected: () => boolean,
    isReverted: () => boolean,
    isError: () => boolean,
};

type Factory = {
    [V in TxVariants]: (data: TransactionResponse[V]) => TxRVariant
}

class TxResponseVariant {
    public _status: TxVariants;
    public _content: any;
    private readonly isSuccessValue: boolean;
    private readonly isRejectedValue: boolean;
    private readonly isRevertedValue: boolean;
    private readonly isErrorValue: boolean;

    constructor(...args: any[]) {
        this._status = args[0];
        this._content = args.length > 2 ? args.slice(1) : args[1];
        this.isSuccessValue = this._status === "Success";
        this.isRejectedValue = this._status === "Rejected";
        this.isRevertedValue = this._status === "Reverted";
        this.isErrorValue = this._status === "Error";
    }

    match(this: TxResponseVariant, handlerFns: Record<TxVariants | "_", CallableFunction | undefined>): any {
        if (typeof handlerFns[this._status] !== "undefined") {
            return handlerFns[this._status]!(this._content);
        } else {
            return handlerFns["_"]!();
        }
    }

    get isSuccess() { return () => this.isSuccessValue; }
    get isRejected() { return () => this.isRejectedValue; }
    get isReverted() { return () => this.isRevertedValue; }
    get isError() { return () => this.isErrorValue; }
}

function create(...args: any[]) {
    return new TxResponseVariant(...args);
}



function responseTxFactory(): Factory {
    return factoryProxy as Factory;
}

const factoryProxy = new Proxy({}, {
    get(target, prop, receiver) {
        return (...args: any[]) => create(prop, ...args);
    }
});


// *********** test ********


function transactionResponse(txH: BigNumberish): TxRVariant {
    const resp: GetTransactionReceiptResponse = {
        type: 'DECLARE',
        transaction_hash: '0x5ad959d524679cd3a3913e75fb90eefe83fbfbad7ac750a5b87f8cb6474d7ec',
        actual_fee: '0x1509a9f080800',
        messages_sent: [],
        events: [
            {
                from_address: '0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
                keys: ['0x01'],
                data: ['0x02']
            }
        ],
        execution_status: 'SUCCEEDED',
        finality_status: 'ACCEPTED_ON_L2',
        block_hash: '0x2580c9b48f90a6a17f830aa4081ea9085382cf8a7f0d23787f003f4be53c566',
        block_number: 0
    }
    const TransactionResponse: Factory = responseTxFactory();
    console.log("txr =", TransactionResponse);
    switch (true) {
        case ("execution_status" in resp) && resp.execution_status === TransactionExecutionStatus.SUCCEEDED: {
            return TransactionResponse.Success(resp as SuccessfulTransactionReceiptResponse);
        }
        // 2 other cases
        default: { return TransactionResponse.Error(new Error("It has fail somewhere.")); }
    }
}


const transactionResp: TxRVariant = transactionResponse("0x00");
console.log(transactionResp._content);
console.log(transactionResp._status);
console.log(transactionResp.isSuccess());
console.log(transactionResp.isRejected());
console.log(transactionResp.match({
    Success: () => "success!",
    _: () => "unsuccess"
}));

function handleError(mes: TxRVariant): string {
    return mes.match({
        Error: (err) => err,
        _: () => "No Error"
    })
}

transactionResp.match({
    Success: (txR: SuccessfulTransactionReceiptResponse) => { console.log("success =", txR) },
    Rejected: (txR: RejectedTransactionReceiptResponse) => { console.log("Rejected =", txR) },
    Reverted: (txR: RevertedTransactionReceiptResponse) => { console.log("Reverted =", txR) },
    Error: (err: Error) => { console.log("no success =", err) },

});
