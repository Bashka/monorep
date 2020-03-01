const
	cla = require('command-line-args'),
	{blue, green, red} = require('colors'),
	{RuntimeError} = require('../lib/error'),
	{compose, id, prop, trace, TreeNode} = require('../lib/fp'),
	{list, nl} = require('../lib/view'),
  {of: widget, pointLoader: loader} = require('../views'),
	{Monorep, Package} = require('../monorep'),
  {upHelp} = require('./helps')
;

const dependencyNodeTree = monorep => p => {
  return new TreeNode(
    p,
    monorep
      .filter(Monorep.dependent(p))
      .packages.map(dependencyNodeTree(monorep))
  )
};

const execRecursive = fn => async t => {
	await Promise.all(t.map(fn));

	return Promise.all(t.children.map(execRecursive(fn)));
};

const packageView = widget(({name, fromVersion, toVerstion, status, loader}) => {
  const colors = {
    wait: () => blue(`wait${loader()}`),
    save: () => blue(`save${loader()}`),
    update: () => blue(`update${loader()}`),
    commit: () => blue(`commit${loader()}`),
    publish: () => blue(`publish${loader()}`),
    success: () => green('success'),
    error: () => red('error')
  };

  return `* ${blue(name)} ${fromVersion} -> ${toVerstion} - ${colors[status]()}`
});

module.exports = async (monorep, argv) => {
	/**
	 * @type {{
	 *     package: string,
   *     version: string,
   *     no-save: boolean,
   *     no-update: boolean,
   *     no-publish: boolean,
   *     no-commit: boolean
	 * }}
	 */
	const params = cla([
		{name: 'package', defaultOption: true},
		{name: 'version', alias: 'v', type: String, defaultValue: 'patch'},
		{name: 'help', alias: 'h', type: Boolean, defaultValue: false},
		{name: 'no-all', type: Boolean, defaultValue: false},
		{name: 'no-save', type: Boolean, defaultValue: false},
		{name: 'no-update', type: Boolean, defaultValue: false},
		{name: 'no-publish', type: Boolean, defaultValue: false},
		{name: 'no-commit', type: Boolean, defaultValue: false}
	], {argv, stopAtFirstUnknown: true});
  upHelp(params);
  if (params['no-all']) params['no-save'] = params['no-update'] = params['no-publish'] = params['no-commit'] = true;
  if (params['no-save'] && !params['no-update']) throw new RuntimeError('Update package not available without --no-save');
  if (params['no-save'] && !params['no-publish']) throw new RuntimeError('Publish package not available without --no-save');
  if (params['no-save'] && !params['no-commit']) throw new RuntimeError('Commit package not available without --no-save');

	const p = monorep.find(Monorep.byName(params.package));
	if (p === null) throw new RuntimeError(`Package "${params.package}" not found`);

  console.log(`Up version ${blue(p.name)} ${p.version} with:`);

	const
    dependency = dependencyNodeTree(monorep)(p),
    updatedDependency = dependency
      .filter((node, parent) =>
        parent !== p || node.packageJson.dependencies[p.name] !== p.version
      )
      .reduce((node, parent) => {
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

  const views = new Map(
    updatedDependency.flatMap(p => {
      const state = {
        loader: loader({n: 0}),
        name: p.name,
        fromVersion: monorep.find(Monorep.byName(p.name)).version,
        toVerstion: p.version,
        status: 'wait'
      };

      return [
        p.name,
        {state, view: packageView(state)()}
      ];
    })
  );
	setInterval(
    () => Array.from(views.values()).forEach(({view}) => view()),
		500
	);

	if (!params['no-save']) await Promise.all(updatedDependency.flatMap(async p => {
    const state = views.get(p.name).state;
    state.status = 'save';
    await Package.save({
      wrap         : 0,
      indent       : '\t',
      aligned      : true,
      objectPadding: 1,
      afterComma   : 1,
      afterColonN  : 1
    })(p);
    state.status = 'wait';
  }));
	await execRecursive(async p => {
    const state = views.get(p.name).state;

		if (!params['no-update']) {
      state.status = 'update';
      await Package.update(p);
    }
		if (!params['no-commit']) {
      state.status = 'commit';
      await Package.commit({})(p);
    }
		if (!params['no-publish']) {
      state.status = 'publish';
      await Package.publish(p);
    }
    state.status = 'success';
	})(updatedDependency);

  setTimeout(() => {
    console.log(green('complete'));
    process.exit(0);
  }, 500);
};
