const path = require("path");
const EC = require("elliptic").ec;
const fs = require("fs");
const keccak256 = require("keccak256");
const ec = new EC("secp256k1");
const eip55 = require("eip55");
const privateKeyDir = path.join(__dirname, "wallet");
const privateKeyFileBase = path.join(privateKeyDir, "private_key");

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

    const key = ec.keyFromPrivate(privateKey, "hex");
    const publicKey = key.getPublic().encode("hex");
    // Take hash of public key to derive the address.
    // Similar to Ethereum, uses last 20 bytes of the hash as the address.
    // Prefixed with "0x" to indicate it's a hexadecimal number.
    // Creates a mixed-case checksum address according to Ethereum's EIP-55 specification.
    const address = eip55.encode("0x" + keccak256(publicKey).toString("hex").slice(-40));

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