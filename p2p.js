const crypto = require("crypto");
// Used for connecting to peers in a network by using the discovery-channel
const Swarm = require("discovery-swarm");
// Deploys servers that help identify other potential peers
const defaults = require("dat-swarm-defaults");
// Retrieves available TCP ports
const getPort = require("get-port");
const chain = require("./chain");
const CronJob = require("cron").CronJob;
const express = require("express");
const bodyParser = require("body-parser");
const wallet = require("./wallet");
const peers = {};
let connSeq = 0;
let channel = "bloquechain";
let registeredMiners = [];
let lastBlockMinedBy = null;

// Define a message type to request and receive the latest block
let MessageType = {
    REQUEST_BLOCK: "requestBlock",
    RECEIVE_NEXT_BLOCK: "receiveNextBlock",
    RECEIVE_NEW_BLOCK: "receiveNewBlock",
    REQUEST_ALL_REGISTER_MINERS: "requestAllRegisterMiners",
    REGISTER_MINER: "registerMiner",
};

const myPeerId = crypto.randomBytes(32);

console.log("myPeerId: " + myPeerId.toString("hex"));

// Create a database
chain.createDb(myPeerId.toString("hex"));

// Initiates the server and creates the services
let initHttpServer = (port) => {
    let http_port = "80" + port.toString().slice(-2);
    let app = express();

    // Loads middleware function that only parses json and only looks at requests where the Content-Type header matches the type option
    // A new body object containing the parsed data is populated on the request object after the middleware (i.e. req.body).
    app.use(bodyParser.json());

    // blocks service to retrieve all blocks
    app.get("/blocks", (req, res) =>
        res.send(JSON.stringify(chain.blockchain, undefined, 4))
    );

    // getBlock service will be retrieving one block based on an index
    app.get("/getBlock", (req, res) => {
        let blockIndex = req.query.index;

        res.send(chain.blockchain[blockIndex]);
    });

    // getDBBlock service will be retrieving a LevelDB database entry based on an index
    app.get("/getDBBlock", (req, res) => {
        let blockIndex = req.query.index;

        chain.getDbBlock(blockIndex, res);
    });

    // getWallet service will be utilizing the wallet.js file to generate a public-private key pair
    app.get("/getWallet", (req, res) => {
        res.send(wallet.initWallet());
    });

    app.listen(http_port, () =>
        console.log("Listening http on port: " + http_port)
    );
};

// Generate a config object that holds the peer ID
const config = defaults({
    id: myPeerId,
});

// Initialize swarm library using config as object
const swarm = Swarm(config);

(async () => {
    // listen on the random port selected
    const port = await getPort();

    initHttpServer(port);

    swarm.listen(port);

    console.log("Listening port: " + port);

    swarm.join(channel);

    // Emitted when fully connected to another peer.
    // info is an object that contains info about the connection.
    swarm.on("connection", (conn, info) => {
        const seq = connSeq;
        const peerId = info.id.toString("hex");

        console.log(`\nConnected #${seq} to peer: ${peerId}\n`);

        // If we initiated the connection...
        if (info.initiator) {
            try {
                // use setKeepAlive to ensure the network connection stays with other peers
                //conn.setKeepAlive(true, 60000);
            } catch (exception) {
                console.log("exception", exception);
            }
        }

        // Once a data message is received on the P2P network, parse the data using JSON.parse
        conn.on("data", (data) => {
            let message;

            try {
                message = JSON.parse(data);
            } catch (exception) {
                console.log(
                    "EXCEPTION: Could not parse message from peer: " +
                        peerId.toString("hex")
                );

                return;
            }

            console.log("\n=================================================");
            console.log("\n             Received Message Start              ");
            console.log("\n=================================================");
            console.log(
                "from: " + peerId.toString("hex"),
                "to: " + peerId.toString(message.to),
                "my: " + myPeerId.toString("hex"),
                "type: " + JSON.stringify(message.type, undefined, 4)
            );
            console.log("\n=================================================");
            console.log("\n             Received Message End                ");
            console.log("\n=================================================");

            // Handle the different types of message requests.
            switch (message.type) {
                case MessageType.REQUEST_BLOCK:
                    console.log(
                        "\n================================================="
                    );
                    console.log("\n           REQUEST_BLOCK START           ");
                    console.log(
                        "\n================================================="
                    );

                    let requestedIndex = JSON.parse(
                        JSON.stringify(message.data, undefined, 4)
                    ).index;

                    let requestedBlock = chain.getBlock(requestedIndex);

                    if (requestedBlock) {
                        writeMessageToPeerToId(
                            peerId.toString("hex"),
                            MessageType.RECEIVE_NEXT_BLOCK,
                            requestedBlock
                        );
                    } else {
                        console.log(
                            "No block found @ index: " + requestedIndex
                        );
                    }

                    console.log(
                        "\n================================================="
                    );
                    console.log("\n           REQUEST_BLOCK END             ");
                    console.log(
                        "\n================================================="
                    );

                    break;
                case MessageType.RECEIVE_NEXT_BLOCK:
                    console.log(
                        "\n================================================="
                    );
                    console.log(
                        "\n             RECEIVE_NEXT_BLOCK START            "
                    );
                    console.log(
                        "\n================================================="
                    );

                    chain.addBlock(
                        JSON.parse(JSON.stringify(message.data, undefined, 4))
                    );

                    console.log(JSON.stringify(chain.blockchain, undefined, 4));

                    let nextBlockIndex = chain.getLatestBlock().index + 1;

                    console.log(
                        "-- Request next block @ index: " + nextBlockIndex
                    );

                    writeMessageToPeers(MessageType.REQUEST_BLOCK, {
                        index: nextBlockIndex,
                    });

                    console.log(
                        "\n================================================="
                    );
                    console.log(
                        "\n             RECEIVE_NEXT_BLOCK END              "
                    );
                    console.log(
                        "\n================================================="
                    );

                    break;
                case MessageType.RECEIVE_NEW_BLOCK:
                    if (
                        message.to === myPeerId.toString("hex") &&
                        message.from !== myPeerId.toString("hex")
                    ) {
                        console.log(
                            "\n================================================="
                        );
                        console.log(
                            "\n             RECEIVE_NEW_BLOCK START            "
                        );
                        console.log(
                            "\n================================================="
                        );
                        console.log("\nTO: " + message.to + "\n\n");

                        chain.addBlock(
                            JSON.parse(
                                JSON.stringify(message.data, undefined, 4)
                            )
                        );

                        console.log(
                            JSON.stringify(chain.blockchain, undefined, 4)
                        );
                        console.log(
                            "\n================================================="
                        );
                        console.log(
                            "\n             RECEIVE_NEW_BLOCK END               "
                        );
                        console.log(
                            "\n================================================="
                        );
                    }

                    break;
                case MessageType.REQUEST_ALL_REGISTER_MINERS:
                    console.log(
                        "\n================================================="
                    );
                    console.log(
                        "\n             REQUEST_ALL_REGISTER_MINERS START   "
                    );
                    console.log(
                        "\n================================================="
                    );
                    console.log("\nTO: " + message.to + "\n\n");

                    writeMessageToPeers(
                        MessageType.REGISTER_MINER,
                        registeredMiners
                    );

                    registeredMiners = JSON.parse(JSON.stringify(message.data));

                    console.log(
                        "\n================================================="
                    );
                    console.log(
                        "\n             REQUEST_ALL_REGISTER_MINERS END   "
                    );
                    console.log(
                        "\n================================================="
                    );

                    break;
                case MessageType.REGISTER_MINER:
                    console.log(
                        "\n================================================="
                    );
                    console.log("\n         REGISTER_MINER START            ");
                    console.log(
                        "\n================================================="
                    );
                    console.log("\nTO: " + message.to + "\n\n");

                    let miners = JSON.stringify(message.data);
                    registeredMiners = JSON.parse(miners);

                    console.log(registeredMiners);
                    console.log(
                        "\n================================================="
                    );
                    console.log("\n         REGISTER_MINER END              ");
                    console.log(
                        "\n================================================="
                    );
                    break;
            }
        });

        /**
         * Listen to a close event, which will indicate a lost connection with peers, and take action, such as deleting
         * the peers from the peers list object.
         */
        conn.on("close", () => {
            console.log(`\nConnection ${seq} closed, peerId: ${peerId}\n`);

            if (peers[peerId].seq === seq) {
                delete peers[peerId];
                console.log(
                    "\n================================================="
                );
                console.log("\n             REGISTERED MINERS START     ");
                console.log(
                    "\n================================================="
                );
                console.log(
                    "\nBEFORE: " + JSON.stringify(registeredMiners) + "\n"
                );

                index = registeredMiners.indexOf(peerId);

                if (index > -1) {
                    registeredMiners.splice(index, 1);
                }

                console.log(
                    "\nEND: " + JSON.stringify(registeredMiners) + "\n"
                );
                console.log(
                    "\n================================================="
                );
                console.log("\n             REGISTERED MINERS END       ");
                console.log(
                    "\n================================================="
                );
            }
        });

        if (!peers[peerId]) {
            peers[peerId] = {};
        }

        peers[peerId].conn = conn;
        peers[peerId].seq = seq;

        connSeq++;
    });
})();

// Send messages to all the connected peers
writeMessageToPeers = (type, data) => {
    for (let id in peers) {
        console.log("\n=================================================");
        console.log("\n             WRITE MESSAGE TO PEERS START        ");
        console.log("\n=================================================");
        console.log("\ntype: " + type + ", to: " + id);
        console.log("\n=================================================");
        console.log("\n             WRITE MESSAGE TO PEERS END          ");
        console.log("\n=================================================");

        sendMessage(id, type, data);
    }
};

// Send a message to a specific peer ID
writeMessageToPeerToId = (toId, type, data) => {
    for (let id in peers) {
        if (id === toId) {
            console.log("\n=================================================");
            console.log("\n             WRITE MESSAGE TO PEER ID START      ");
            console.log("\n=================================================");
            console.log("\ntype: " + type + ", to: " + toId);
            console.log("\n=================================================");
            console.log("\n             WRITE MESSAGE TO PEER ID END        ");
            console.log("\n=================================================");

            sendMessage(id, type, data);
        }
    }
};

/**
 *  A generic method that will be used to send a message formatted with the provided params:
 *    – to: The peer ID to send the message to
 *    – type: The message type
 *    – data: Any data to share on the P2P network
 */
sendMessage = (id, type, data) => {
    peers[id].conn.write(
        JSON.stringify({
            to: id,
            from: myPeerId,
            type: type,
            data: data,
        })
    );
};

setTimeout(function () {
    writeMessageToPeers(MessageType.REQUEST_ALL_REGISTER_MINERS, null);
}, 5000);

// Send a request to retrieve the latest block every 5 seconds
setTimeout(function () {
    writeMessageToPeers(MessageType.REQUEST_BLOCK, {
        index: chain.getLatestBlock().index + 1,
    });
}, 5000);

// Send a request to register this miner every 7 seconds
setTimeout(function () {
    try {
        registeredMiners.push(myPeerId.toString("hex"));

        console.log("\n=================================================");
        console.log("\n             REGISTER MY MINER START             ");
        console.log("\n=================================================\n");
        console.log(registeredMiners);

        writeMessageToPeers(MessageType.REGISTER_MINER, registeredMiners);

        console.log("\n=================================================");
        console.log("\n             REGISTER MY MINER END               ");
        console.log("\n=================================================\n");
    } catch (exception) {
        console.log("EXCEPTION: Could not register miner");
    }
}, 7000);

const job = new CronJob("10 * * * * *", function () {
    // First block
    let index = 0;

    // Requesting next block from the next miner
    if (lastBlockMinedBy) {
        newIndex = registeredMiners.indexOf(lastBlockMinedBy);
        index = newIndex + 1 > registeredMiners.length - 1 ? 0 : newIndex + 1;
    }

    lastBlockMinedBy = registeredMiners[index];

    console.log(
        "\n-- REQUESTING NEW BLOCK FROM: " +
            registeredMiners[index] +
            ", index: " +
            index +
            "\n"
    );

    console.log(JSON.stringify(registeredMiners));

    if (registeredMiners[index] === myPeerId.toString("hex")) {
        console.log("\n=================================================");
        console.log("\n             CREATE NEXT BLOCK START             ");
        console.log("\n=================================================\n");

        let newBlock = chain.generateNextBlock(null);

        chain.addBlock(newBlock);

        console.log("New Block:\n");
        console.log(JSON.stringify(newBlock, undefined, 4));
        writeMessageToPeers(MessageType.RECEIVE_NEW_BLOCK, newBlock);

        console.log("\nBlockchain:\n");
        console.log(JSON.stringify(chain.blockchain, undefined, 4));
        console.log("\n=================================================");
        console.log("\n             CREATE NEXT BLOCK END               ");
        console.log("\n=================================================\n");
    }
});

job.start();
