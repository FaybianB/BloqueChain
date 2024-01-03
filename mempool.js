const chain = require("./chain");
let transactions = [];

let addTransaction = (newTransaction) => {
    this.transactions.push(newTransaction);
};

let getDBTransaction = (index, res) => {
    chain.db.get("transaction_" + index, function (err, value) {
        if (err) {
            res.send(JSON.stringify(err));
        } else {
            res.send(value);
        }
    });
};

let getTransaction = (index) => {
    if (this.transactions.length - 1 >= index) {
        return this.transactions[index];
    } else {
        return null;
    }
};

let updateMempool = (updatedMempool) => {
    this.transactions = updatedMempool;
};

if (typeof exports != "undefined") {
    exports.transactions = transactions;
    exports.addTransaction = addTransaction;
    exports.getDBTransaction = getDBTransaction;
    exports.getTransaction = getTransaction;
    exports.updateMempool = updateMempool;
}
