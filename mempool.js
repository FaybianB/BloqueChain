const chain = require("./chain");
let transactions = [];

let addTransaction = (newTransaction) => {
    this.transactions.push(newTransaction);
};

let updateMempool = (updatedMempool) => {
    this.transactions = updatedMempool;
};

if (typeof exports != "undefined") {
    exports.transactions = transactions;
    exports.addTransaction = addTransaction;
    exports.updateMempool = updateMempool;
}
