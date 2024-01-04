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

### Create a Transaction
**Command**: `cli wallet --transact [port]`
**Parameters**:
- `port` (integer): The port number of the node to connect to.

**Description**: Creates a new random transaction from the current wallet.

**Example Usage**: `cli wallet --transact 3001`
**Sample Return Data**:
```json
{
    "hash": "0x69c322e3248a5dfc29d73c5b0553b0185a35cd5bb6386747517ef7e53b15e287",
    "nonce": 2,
    "blockHash": null,
    "blockNumber": null,
    "transactionIndex": 3,
    "from": "0x32cEcF257eFA775d829919bCf118bEA9243CB6c3",
    "to": "0xd048973eae21e94d696c8b7b4660eb5373f8678e",
    "value": 345628739661532300000,
    "gas": 144028847758638660000,
    "gasPrice": 409476170533504350000,
    "input": "0x85157b9bc631fb4d852396983a4c6a5e07f5669773b5e7b46284acafb6f22969",
    "signature": {
        "r": "48750874dee238a6033c45489006665fc4c4b14e91f988558cb90f402da0f3b5",
        "s": "ca6cf8ae4332d5667820534a79e8964ad1fd97c29f28ebb3776910871073a900",
        "recoveryParam": 1
    }
}
```
---

These CLI commands provide an intuitive and efficient way to interact with the BloqueChain network, allowing users to easily access blockchain data and manage wallets. Ensure to use the correct port number where your BloqueChain node is running.