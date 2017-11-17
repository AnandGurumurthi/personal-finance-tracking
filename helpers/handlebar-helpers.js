exports.if_eq = function (a, b) {
    return a == b;
};

exports.formatCurrency = function (n) {
	var num = Number(n);
	return "$" + num.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
}

exports.formatDate = function(givenDate) {
	var d = new Date(Date.parse(givenDate));
	return isNaN (d) ? 'NaN' : [d.getMonth() > 8 ? d.getMonth() + 1 : '0' +  (d.getMonth() + 1), d.getDate() > 9 ? d.getDate() : '0' + d.getDate(),  d.getFullYear()].join('/');
}

exports.ifIn = function(elem, list, options) {
  if(list.indexOf(elem) > -1) {
    return options.fn(this);
  }
  return options.inverse(this);
}

exports.for = function(from, to, incr, block) {
    var accum = '';
    for(var i = from; i < to; i += incr)
        accum += block.fn(i);
    return accum;
}