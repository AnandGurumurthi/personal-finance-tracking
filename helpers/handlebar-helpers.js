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