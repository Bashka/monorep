const
	cla = require('command-line-args'),
	{blue, green, red} = require('colors'),
	{RuntimeError} = require('../lib/error'),
	{compose, id, TreeNode} = require('../lib/fp'),
	{of: widget, pointLoader: loader} = require('../views'),
	{Monorep, Package} = require('../monorep'),
	{upHelp} = require('./helps')
;

const dependencyNodeTree = monorep => p => {
	return new TreeNode(
		p,
		monorep.filter(Monorep.dependent(p)).packages.map(dependencyNodeTree(monorep))
	);
};

const execRecursive = fn => async t => {
	await Promise.all(t.map(fn));

	return Promise.all(t.children.map(execRecursive(fn)));
};

const packageView = widget(({name, fromVersion, toVersion, status, error, loader}) => {
	const colors = {
		wait   : () => blue(`wait${loader()}`),
		save   : () => blue(`save${loader()}`),
		update : () => blue(`update${loader()}`),
		pretty : () => blue(`pretty${loader()}`),
		add    : () => blue(`add${loader()}`),
		commit : () => blue(`commit${loader()}`),
		push   : () => blue(`push${loader()}`),
		publish: () => blue(`publish${loader()}`),
		success: () => green('success'),
		error  : () => red(`error: ${error}`)
	};

	return `* ${blue(name)} ${fromVersion} -> ${toVersion} - ${colors[status]()}`;
});

module.exports = async (monorep, argv) => {
	/**
	 * @var {{
	 *     package: string,
	 *     version: string,
	 *     no-save: boolean,
	 *     no-pretty: boolean,
	 *     no-update: boolean,
	 *     no-publish: boolean,
	 *     no-commit: boolean,
	 *     no-push: boolean
	 * }}
	 */
	const params = cla([
		{name: 'package', defaultOption: true},
		{name: 'version', alias: 'v', type: String, defaultValue: 'patch'},
		{name: 'help', alias: 'h', type: Boolean, defaultValue: false},
		{name: 'commit-message', alias: 'm', type: String, defaultValue: ''},
		{name: 'no-all', type: Boolean, defaultValue: false},
		{name: 'no-save', type: Boolean, defaultValue: false},
		{name: 'no-pretty', type: Boolean, defaultValue: false},
		{name: 'no-update', type: Boolean, defaultValue: false},
		{name: 'no-push', type: Boolean, defaultValue: false},
		{name: 'no-publish', type: Boolean, defaultValue: false},
		{name: 'no-commit', type: Boolean, defaultValue: false}
	], {argv, stopAtFirstUnknown: true});
	if (!params.package) params.help = true;
	upHelp(params);
	if (params['no-all']) params['no-save'] = params['no-pretty'] = params['no-update'] = params['no-publish'] = params['no-commit'] = params['no-push'] = true;
	if (params['no-save'] && !params['no-pretty']) throw new RuntimeError('Pretty package not available without --no-save');
	if (params['no-save'] && !params['no-update']) throw new RuntimeError('Update package not available without --no-save');
	if (params['no-save'] && !params['no-publish']) throw new RuntimeError('Publish package not available without --no-save');
	if (params['no-save'] && !params['no-commit']) throw new RuntimeError('Commit package not available without --no-save');
	if (params['no-commit'] && !params['no-push']) throw new RuntimeError('Push package not available without --no-commit');
	if (params['no-save'] && !params['no-push']) throw new RuntimeError('Push package not available without --no-save');

	const p = monorep.find(Monorep.byName(params.package));
	if (p === null) throw new RuntimeError(`Package "${params.package}" not found`);

	console.log(`Up version ${blue(p.name)} ${p.version} with:`);

	const
		dependency = dependencyNodeTree(monorep)(p),
		updatedDependency = dependency.filter((node, parent) =>
			parent !== p || node.packageJson.dependencies[p.name] !== p.version
		).reduce((node, parent) => {
			return node.map(
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
			);
		})
	;

	const
		views = new Map(
			updatedDependency.flatMap(p => {
				const state = {
					loader     : loader({n: 0}),
					name       : p.name,
					fromVersion: monorep.find(Monorep.byName(p.name)).version,
					toVersion  : p.version,
					status     : 'wait',
					error      : ''
				};

				return [
					p.name,
					{state, view: packageView(state)()}
				];
			})
		),
		renderViews = () => Array.from(views.values()).forEach(({view}) => view())
	;
	setInterval(renderViews, 500);

	if (!params['no-save']) {
		await Promise.all(updatedDependency.flatMap(async p => {
			const state = views.get(p.name).state;
			state.status = 'save';
			await Package.save(monorep.config.pretty)(p);
			state.status = 'wait';
		}));
	}

	const {add, update, commit, push, publish} = monorep.config.exec;
	await execRecursive(async p => {
		const state = views.get(p.name).state;

		try {
			if (!params['no-update']) {
				state.status = 'update';
				await Package.update({exec: update})(p);
			}
			if (!params['no-pretty']) {
				state.status = 'pretty';
				await Package.pretty(monorep.config.pretty)(p);
			}
			if (!params['no-commit']) {
				state.status = 'add';
				await Package.commit({exec: add})(p);
				state.status = 'commit';
				await Package.commit({exec: `${commit} -m "${params['commit-message']}"`})(p);
			}
			if (!params['no-push']) {
				state.status = 'push';
				await Package.push({exec: push})(p);
			}
			if (!params['no-publish'] && !monorep.config['no-publish'].includes(p.name)) {
				state.status = 'publish';
				await Package.publish({exec: publish})(p);
			}
		} catch (e) {
			state.status = 'error';
			state.error = e;
			renderViews();

			process.exit(1);
		}

		state.status = 'success';
	})(updatedDependency);

	renderViews();
	console.log(green('complete'));
	process.exit(0);
};
