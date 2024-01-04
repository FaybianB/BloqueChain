const path = require("path");
const Block = require("./block.js").Block;
const BlockHeader = require("./block.js").BlockHeader;
const moment = require("moment");
const keccak256 = require("keccak256");
const { Level } = require("level");
const fs = require("fs");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
const mempool = require("./mempool");
const Transaction = require("./transaction.js").Transaction;
let db;

let createDb = async (peerId) => {
    let dir = path.join(__dirname, "db", peerId);

    try {
        await fs.promises.mkdir(dir, { recursive: true });

        db = new Level(dir);

        storeBlock(getGenesisBlock());
    } catch (err) {
        console.error("Error creating database:", err);
    }
};

let getGenesisBlock = () => {
    let blockHeader = new BlockHeader(
        1,
        null,
        "0x1bc1100000000000000000000000000000000000000000000",
        moment().unix(),
        "0x171b7320",
        "1CAD2B8C"
    );

    return new Block(blockHeader, 0, null);
};

let getLatestBlock = () => blockchain[blockchain.length - 1];

let addBlock = (newBlock) => {
    let prevBlock = getLatestBlock();

    if (
        prevBlock.index < newBlock.index &&
        newBlock.blockHeader.previousBlockHeader ===
            prevBlock.blockHeader.merkleRoot
    ) {
        blockchain.push(newBlock);

        // When a new block is generated, store the block in the LevelDB database
        storeBlock(newBlock);
    }
};

// Store the new block
let storeBlock = (newBlock) => {
    db.put("block_" + newBlock.index, JSON.stringify(newBlock), function (err) {
        if (err) {
            console.error("\nError storing block:", err);
        } else {
            console.log("\n--- Inserting block index: " + newBlock.index);
        }
    });
};

let getDbBlock = (index, res) => {
    db.get("block_" + index, function (err, value) {
        if (err) {
            res.send(JSON.stringify(err));
        } else {
            res.send(value);
        }
    });
};

let getBlock = (index) => {
    if (blockchain.length - 1 >= index) {
        return blockchain[index];
    } else {
        return null;
    }
};

const blockchain = [getGenesisBlock()];

const generateNextBlock = () => {
    const prevBlock = getLatestBlock();
    const prevMerkleRoot = prevBlock.blockHeader.merkleRoot;
    nextIndex = prevBlock.index + 1;
    nextTime = moment().unix();
    nextMerkleRoot = "0x" + keccak256(prevMerkleRoot + nextTime + nextIndex).toString("hex");

    const blockHeader = new BlockHeader(
        1,
        prevMerkleRoot,
        nextMerkleRoot,
        nextTime
    );

    const txns = getVerifiedTransactions(nextMerkleRoot, nextIndex);
    const newBlock = new Block(blockHeader, nextIndex, txns);

    blockchain.push(newBlock);

    storeBlock(newBlock);

    return newBlock;
};

let getVerifiedTransactions = (blockHash, blockNumber) => {
    let verifiedTransactions = [];
    let unverifiedTransactions = [];

    for (let i = 0; i < mempool.transactions.length; i++) {
        let transaction = mempool.transactions[i];
        let signature = transaction.signature;

        transaction = new Transaction(
            transaction.hash,
            transaction.nonce,
            transaction.blockHash,
            transaction.blockNumber,
            transaction.transactionIndex,
            transaction.from,
            transaction.to,
            transaction.value,
            transaction.gas,
            transaction.gasPrice,
            transaction.input
        );

        let msgHash = Object.values(transaction);
        let publicKey;
        let key;
        let verified = false;

        // Verify signature of transaction
        try {
            publicKey = ec
                .recoverPubKey(msgHash, signature, signature.recoveryParam)
                .encode("hex");
            key = ec.keyFromPublic(publicKey, "hex");
            verified = key.verify(msgHash, signature);
        } catch (exception) {
            console.log("ERROR: Failed to recover public key");
        }

        if (verified) {
            transaction.signature = signature;
            transaction.blockHash = blockHash;
            transaction.blockNumber = blockNumber;

            verifiedTransactions.push(transaction);

            storeTransaction(transaction);
        } else {
            unverifiedTransactions.push(transaction);
        }
    }

    mempool.updateMempool(unverifiedTransactions);

    return verifiedTransactions;
};

// Store the new transaction
let storeTransaction = (newTransaction) => {
    db.put(
        "transaction_" + newTransaction.hash,
        JSON.stringify(newTransaction),
        function (err) {
            if (err) {
                console.error("\nError storing transaction:", err);
            } else {
                console.log(
                    "\n--- Inserting transaction hash: " +
                        newTransaction.hash
                );
            }
        }
    );
};

let getDbTransaction = (hash, res) => {
    db.get("transaction_" + hash, function (err, value) {
        if (err) {
            res.send(JSON.stringify(err));
        } else {
            res.send(value);
        }
    });
};

if (typeof exports != "undefined") {
    exports.addBlock = addBlock;
    exports.getBlock = getBlock;
    exports.blockchain = blockchain;
    exports.getLatestBlock = getLatestBlock;
    exports.generateNextBlock = generateNextBlock;
    exports.createDb = createDb;
    exports.getDbBlock = getDbBlock;
    exports.getDbTransaction = getDbTransaction;
    exports.db = db;
}
