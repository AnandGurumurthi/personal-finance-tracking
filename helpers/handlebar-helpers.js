exports.if_eq = function (a, b) {
    return a == b;
};

exports.formatCurrency = function (n) {
	var num = Number(n);
    return "$" + num.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
}