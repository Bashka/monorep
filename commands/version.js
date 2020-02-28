const
	cla = require('command-line-args'),
	{blue} = require('colors'),
	{RuntimeError} = require('../lib/error'),
	{compose} = require('../lib/fp'),
	{list, nl} = require('../lib/view')
;

module.exports = async (monorep, argv) => {
	/**
	 * @type {{
	 *     package: string
	 * }}
	 */
	const params = cla([
		{name: 'package', defaultOption: true},
		{name: 'version', alias: 'v', type: String}
	], {argv, stopAtFirstUnknown: true});

	const p = monorep.find(params.package);
	if (p === null) throw new RuntimeError(`Package "${params.package}" not found`);

	console.log(params);
};
