const
	cla = require('command-line-args'),
	{blue} = require('colors'),
	{RuntimeError} = require('../lib/error'),
	{compose, prop} = require('../lib/fp'),
	{list, nl} = require('../lib/view'),
	{Monorep} = require('../monorep'),
	{infoHelp} = require('./helps')
;

module.exports = async (monorep, argv) => {
	/**
	 * @type {{
	 *     package: string
	 * }}
	 */
	const params = cla([
		{name: 'package', defaultOption: true},
		{name: 'help', alias: 'h', type: Boolean, defaultValue: false}
	], {argv, stopAtFirstUnknown: true});
	if (!params.package) params.help = true;
	infoHelp(params);

	const p = monorep.find(Monorep.byName(params.package));
	if (p === undefined) throw new RuntimeError(`Package "${params.package}" not found`);

	const
		dependents = monorep.filter(Monorep.dependent(p)).packages,
		dependencies = monorep.filter(Monorep.dependencies(p)).packages
	;

	console.log(
		`${blue(p.name)} ${p.version}
	
dependencies:
${dependencies.map(compose(list, blue, prop('name'))).join(nl)}

dependents:
${dependents.map(compose(list, blue, prop('name'))).join(nl)}
`
	);
	process.exit(0);
};
