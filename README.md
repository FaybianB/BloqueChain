# BloqueChain

BloqueChain is a custom blockchain network built using Node.js. It leverages a peer-to-peer (P2P) architecture to maintain a decentralized network of nodes. This project uses LevelDB, a name-value database, for persistently storing blocks. It also features a comprehensive API for block and wallet information retrieval, alongside a command-line interface for interaction with the API.

## Getting Started

To set up and run BloqueChain, follow these steps:

1. Install dependencies using: `npm install`.
2. Create database, mine genesis block, initialize HTTP server and Start a node using: `node p2p.js`.

## Features

**P2P Network:** Establishes a basic peer-to-peer network for node communication.
**Block Handling:** Supports sending and receiving blocks between nodes.
**Miner Registration:** Allows for the registration of miners and creation of new blocks.
**LevelDB Integration:** Utilizes LevelDB for storing blocks in a name-value pair database.
**Wallet Creation:** Implements a system for creating private-public key wallets.
**API:** Offers an API for data retrieval and interaction with the blockchain.
**CLI:** Provides a command-line interface for easy interaction with the blockchain network.

## Block Structure

```
Example:

{
    "blockHeader": {
        // Indicates the block version.
        "version":1,
        // SHA-256 hash of the previous block’s header.
        "previousBlockHeader":"<hash>",
        // Hash of all key-value pairs in the block's Merkle tree.
        "merkleRoot":"<hash>",
        // Unix epoch time of block creation.
        "time":<Unix timestamp>
        // 32-bit number used in mining to meet the target difficulty.
        "nounce": <number>,
        // Current target, inversely proportional to the difficulty.
        "nBits": null
    },
    // Identifies the block's position in the chain, with the GenesisBlock at index 0.
    "index":<number>,
    // Contains the transaction data within the block.
    "txns":null
}
```

## Consensus

BloqueChain adopts a Proof-of-Stake (PoS) approach. Each peer registers as a miner and takes turns mining blocks. Blocks are generated every 30 seconds using the Node.js cron library.

## Message Types

```
REQUEST_BLOCK: Requests block information for a certain block index
RECEIVE_NEXT_BLOCK: Requests information for the next block
RECEIVE_NEW_BLOCK: Notifies node of new block
REQUEST_ALL_REGISTER_MINERS: Request for all registered miners
REGISTER_MINER: Request to register miner
```

## API Documentation

**_Retrieve All Blocks_**
```
Endpoint: /blocks
Method: GET
Description: Retrieves all blocks in the blockchain.
Response: JSON array of blocks.
```


**_Retrieve a Single Block_**
```
Endpoint: /getBlock
Method: GET
Query Parameters: - index (integer) - Index of the block to retrieve.
Description: Retrieves a block based on its index.
Response: JSON object of the block.
```


**_Retrieve a Block from LevelDB_**
```
Endpoint: /getDBBlock
Method: GET
Query Parameters: - index (integer) - Index of the block in the LevelDB database.
Description: Retrieves a block from the LevelDB database based on its index.
Response: JSON object of the block from the database.
```

**_Generate Wallet_**
```
Endpoint: /getWallet
Method: GET
Description: Generates a public-private key pair for a new wallet.
Response: JSON object with wallet details (public and private keys).
```

## Command Line Interface Documentation

See [here](cli/README.md).

## License

This project is licensed under the MIT License.
