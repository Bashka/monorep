const {great} = require('@test/baz');

function sayHello(name) {
	console.log(`${great}, ${name}`);
}

module.exports = {sayHello};
