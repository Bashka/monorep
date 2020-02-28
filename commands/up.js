const
	cla = require('command-line-args'),
	{blue, green} = require('colors'),
	{RuntimeError} = require('../lib/error'),
	{compose, id, prop, trace, TreeNode} = require('../lib/fp'),
	{list, nl} = require('../lib/view'),
	{Monorep, Package} = require('../monorep')
;
require('draftlog').into(console);

const dependencyNodeTree = monorep => p => new TreeNode(
	p,
	monorep
		.filter(Monorep.dependent(p))
		.packages.map(dependencyNodeTree(monorep))
);

const execRecursive = fn => async t => {
	await Promise.all(t.map(fn));

	return Promise.all(t.children.map(execRecursive(fn)));
};

module.exports = async (monorep, argv) => {
	/**
	 * @type {{
	 *     package: string,
	 *     version: string
	 * }}
	 */
	const params = cla([
		{name: 'package', defaultOption: true},
		{name: 'version', alias: 'v', type: String, defaultValue: 'patch'},
		{name: 'no-save', type: Boolean, defaultValue: false},
		{name: 'no-update', type: Boolean, defaultValue: false},
		{name: 'no-publish', type: Boolean, defaultValue: false},
		{name: 'no-commit', type: Boolean, defaultValue: false}
	], {argv, stopAtFirstUnknown: true});

	const p = monorep.find(Monorep.byName(params.package));
	if (p === null) throw new RuntimeError(`Package "${params.package}" not found`);

	const
		dependency = dependencyNodeTree(monorep)(p),
		updatedDependency = dependency.reduce(
			(node, parent) => node.map(
				parent !== null
					? compose(
						Package.upDependencyVersion(parent),
						{
							major: Package.incMajorVersion,
							minor: Package.incMinorVersion,
							patch: Package.incPatchVersion
						}[params.version]
					)
					: id
			)
		)
	;

	//console.log(JSON.stringify(updatedDependency, null, 4));

	/*
	if (!params['no-save']) await Promise.all(updatedDependency.flatMap(Package.save({
		wrap         : 0,
		indent       : '\t',
		aligned      : true,
		objectPadding: 1,
		afterComma   : 1,
		afterColonN  : 1
	})));
	await execRecursive(async p => {
		if (!params['no-update']) await Package.update(p);
		if (!params['no-commit']) await Package.commit({})(p);
		if (!params['no-publish']) await Package.publish(p);
		return p;
	})(updatedDependency);
	*/

	class CliWidget {
		constructor() {
			this.draw = console.draft();
		}

		render() {
			return '';
		}
	}

	class Header extends CliWidget {
		render() {
			return `Up version ${blue(p.name)} with:`;
		}
	}

	class PackageLoader extends CliWidget {
		constructor() {
			super();
			this.states = ['|', '/', '-', '\\'];
			this.frame = 0;
		}

		render() {
			return this.draw(`* package - ${blue(this.states[this.frame++ % this.states.length])}`);
		}
	}

	const header = new Header();

	const package = new PackageLoader();
	setInterval(
		package.render.bind(package),
		800
	);
	/*
	let frame = 0;
	const states = ['|', '/', '-', '\\'];
	const package = console.draft(`* package - ${blue(states[frame % states.length])}`);
	const updatePackage = () => {
		package(`* package - ${blue(states[frame % states.length])}`);
		frame += 1;
	};

	setInterval(
		updatePackage,
		800
	);
	 */

	/*
	return `Up version ${blue(p.name)} with:

${updatedDependency.flatMap(compose(list, p => `${blue(p.name)} ${monorep.find(Monorep.byName(p.name)).version} -> ${p.version}`)).join(nl)}
  
${green('Success')}
`;
	 */
	return '';
};
