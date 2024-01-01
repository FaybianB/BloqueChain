# CLI Commands Documentation

BloqueChain provides a set of Command Line Interface (CLI) commands for interacting with the blockchain network. These commands allow users to retrieve block information and manage wallets directly from the command line.

## Getting Started

Add alias to `.zshenv` be able to run the CLI from any path location:

`alias cli='node /<location>/BloqueChain/bin/cli.js'`

## Block Commands

### Get a Specific Block
**Command**: `cli block --get [port] [index]`
**Parameters**:
- `port` (integer): The port number of the node to connect to.
- `index` (integer): The index of the block to retrieve.

**Description**: This command returns the block mined at the specified index.

**Example Usage**: `cli block --get 3001 2`
**Sample Return Data**:
```json
{
    "blockHeader": {
        "version": 1,
        "previousBlockHeader": "0000000000000000...",
        "merkleRoot": "d5e8eb4e9...000",
        "time": 1625097602,
        "nounce": 101,
        "nBits": null
    },
    "index": 2,
    "txns": null
}
```

### Get All Blocks
**Command**: `cli block --all [port]`
**Parameters**:
- `port` (integer): The port number of the node to connect to.

**Description**: Returns an array of all blocks that have ever been mined.

**Example Usage**: `cli block --all 3001`
**Sample Return Data**:
```json
[
    {
        "blockHeader": {
            "version": 1,
            ...
        },
        "index": 0,
        "txns": null
    },
    {
        "blockHeader": {
            "version": 1,
            ...
        },
        "index": 1,
        "txns": null
    }
    // ... more blocks
]
```

## Wallet Commands

### Create a Wallet
**Command**: `cli wallet --create [port]`
**Parameters**:
- `port` (integer): The port number of the node to connect to.

**Description**: Creates a wallet with a new private-public key pair.

**Example Usage**: `cli wallet --create 3001`
**Sample Return Data**:
```json
{
    "privateKeyLocation": "/<location>/BloqueChain/wallet/private_key",
    "publicKey": "03f6e1...a8e41c"
}
```

---

These CLI commands provide an intuitive and efficient way to interact with the BloqueChain network, allowing users to easily access blockchain data and manage wallets. Ensure to use the correct port number where your BloqueChain node is running.