var mongoose = require('mongoose');

// Transaction Schema
var TransactionSchema = mongoose.Schema({
  username: {
    type: String,
    index:true
  },
  category: {
    type: String
  },
  type: {
    type: String
  },
  amount: {
    type: String
  }
});

var Transaction = module.exports = mongoose.model('Transaction', TransactionSchema);

module.exports.createTransaction = function(transaction, callback){
  transaction.save(callback);
}

module.exports.getAllTransaction = function(username, callback){
  var query = {username: username};
  Transaction.find(query, callback);
}