var mongoose = require('mongoose');

// Transaction Schema
var TransactionSchema = mongoose.Schema({
  user_id: {
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
    type: Number
  },
  dateOfTransaction: {
    type: Date
  }
});

// Transaction methods
var Transaction = module.exports = mongoose.model('Transaction', TransactionSchema);

module.exports.createTransaction = function(transaction, callback){
  transaction.save(callback);
}

module.exports.getAllTransactionForUser = function(user_id, year, callback){
  var query = {user_id: user_id, dateOfTransaction: {"$gte": new Date(year -1, 12, 1), "$lte": new Date(year, 11, 31)}};
  Transaction.find(query, callback).sort({dateOfTransaction: 'asc'});
}

module.exports.deleteTranscation = function(id, callback){
  Transaction.findByIdAndRemove(id, callback);
}