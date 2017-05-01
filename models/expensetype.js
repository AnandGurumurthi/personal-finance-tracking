var mongoose = require('mongoose');

// Expense type Schema
var ExpenseTypeSchema = mongoose.Schema({
  user_id: {
    type: String,
    index:true
  },
  expenseType: {
    type: String
  }
});

// ExpenseType methods
var ExpenseType = module.exports = mongoose.model('ExpenseType', ExpenseTypeSchema);

module.exports.createExpenseType = function(expenseType, callback){
  expenseType.save(callback);
}

module.exports.getAllExpenseTypeForUser = function(user_id, callback){
  var query = {user_id: user_id};
  ExpenseType.find(query, callback).sort({expenseType: 'asc'});
}

module.exports.deleteExpenseType = function(id, callback){
  ExpenseType.findByIdAndRemove(id, callback);
}