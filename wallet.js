const path = require("path");
const EC = require("elliptic").ec;
const fs = require("fs");
const keccak256 = require("keccak256");
const ec = new EC("secp256k1");
const eip55 = require("eip55");
const crypto = require("crypto");
const mempool = require("./mempool");
const Transaction = require("./transaction.js").Transaction;
const privateKeyDir = path.join(__dirname, "wallet");
const privateKeyFileBase = path.join(privateKeyDir, "private_key");
let nonce = 0;
let address;
let key;

// Generates the actual public-private key
exports.initWallet = (peerId) => {
    let privateKey;
    privateKeyFile = privateKeyFileBase + "_" + peerId;

    // If the directory doesn't exist, create it
    if (!fs.existsSync(privateKeyDir)) {
        fs.mkdirSync(privateKeyDir);
    }

    // Generate a new wallet, if one doesn’t exist
    if (fs.existsSync(privateKeyFile)) {
        const buffer = fs.readFileSync(privateKeyFile, "utf8");
        privateKey = buffer.toString();
    } else {
        privateKey = generatePrivateKey();

        fs.writeFileSync(privateKeyFile, privateKey);
    }

    key = ec.keyFromPrivate(privateKey, "hex");
    const publicKey = key.getPublic().encode("hex");
    // Take hash of public key to derive the address.
    // Similar to Ethereum, uses last 20 bytes of the hash as the address.
    // Prefixed with "0x" to indicate it's a hexadecimal number.
    // Creates a mixed-case checksum address according to Ethereum's EIP-55 specification.
    address = eip55.encode(
        "0x" + keccak256(publicKey).toString("hex").slice(-40)
    );

    return {
        privateKeyLocation: privateKeyFile,
        publicKey: publicKey,
        address: address,
    };
};

const generatePrivateKey = () => {
    const keyPair = ec.genKeyPair();
    const privateKey = keyPair.getPrivate();

    return privateKey.toString(16);
};

// Creates and signs a transaction
exports.generateTransaction = (req, res) => {
    const transactionIndex = mempool.transactions.length + 1;

    transaction = new Transaction(
        "0x" + keccak256(transactionIndex).toString("hex"),
        nonce++,
        null,
        null,
        transactionIndex,
        address,
        req.query.value ?? "0x" + crypto.randomBytes(20).toString("hex"),
        req.query.value ?? Math.floor(Math.random() * 1000000000000000000000),
        Math.floor(Math.random() * 1000000000000000000000),
        Math.floor(Math.random() * 1000000000000000000000),
        "0x" + crypto.randomBytes(32).toString("hex")
    );

    const signature = key.sign(Object.values(transaction));
    transaction.signature = signature;

    mempool.addTransaction(transaction);

    res.send(transaction);
};
