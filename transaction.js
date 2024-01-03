exports.Transaction = class Transaction {
    constructor(
        hash,
        nonce,
        blockHash,
        blockNumber,
        transactionIndex,
        from,
        to,
        value,
        gas,
        gasPrice,
        input,
        signature
    ) {
        // Unique identifier of the transaction.
        this.hash = hash;
        // A counter used to ensure each transaction can only be processed once.
        this.nonce = nonce;
        // The hash of the block in which this transaction is recorded.
        this.blockHash = blockHash;
        // The number of the block in which this transaction is recorded.
        this.blockNumber = blockNumber;
        // The index position of the transaction in the block.
        this.transactionIndex = transactionIndex;
        // The address of the sender.
        this.from = from;
        // The address of the receiver.
        this.to = to;
        // The amount being transferred
        this.value = value;
        // The maximum amount of gas the sender is willing to use in the transaction.
        this.gas = gas;
        // The price the sender is willing to pay per unit of gas, in wei.
        this.gasPrice = gasPrice;
        // Data sent along with the transaction, used for contract interaction.
        this.input = input;
        // The digital signature of the sender
        this.signature = signature;
    }
};
