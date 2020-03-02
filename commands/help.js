const help = require('./helps/help');

module.exports = async () => {
	console.log(help);
	process.exit(0);
};
