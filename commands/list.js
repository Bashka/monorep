const
	{blue} = require('colors'),
	{compose, prop} = require('../lib/fp'),
	{list, nl} = require('../lib/view')
;

module.exports = async monorep => {
	return monorep.packages
		.map(compose(list, p => `${blue(p.name)} ${p.version}`))
		.join(nl)
};
