const
	fs = require('fs'),
	{promises: fsPromises} = require('fs'),
	glob = require('glob'),
	cla = require('command-line-args'),
	config = require('./monorep.json')
;

class Monorep {
	constructor(config) {
		this.config = config;
	}

	async getPackagesList() {
		return Promise.all(
			glob
				.sync(`${config.packages}/*`, {silent: true})
				.map(async packageDir => {
					const packageJson = JSON.parse(await fsPromises.readFile(`${packageDir}/package.json`));

					return ({
						path   : packageDir,
						name   : packageJson.name,
						version: packageJson.version,
						dependencies: packageJson.dependencies || {}
					});
				})
		);
	}

	async getPackage(name) {
		const
			packages = await this.getPackagesList(),
			packagesNames = packages.map(({name}) => name)
		;

		const p = packages.find(({name: packageName}) => name === packageName);
		if (p === undefined) return null;

		const packageJson = JSON.parse(await fsPromises.readFile(`${p.path}/package.json`));
		return {
			...p,
			dependents: packages
				.filter(({dependencies}) => Object.keys(dependencies).includes(p.name))
				.map(({name}) => name),
			dependencies: Object.keys(packageJson.dependencies || {})
				.filter((dependency) => packagesNames.includes(dependency))
		}
	}
}

try {
	(async(config) => {
		config = {
			packages: 'packages',
			...config
		};

		if (!await fs.existsSync(config.packages)) throw new Error(`Packages directory not found in "${config.packages}"`);

		const packagesDir = await fsPromises.lstat(config.packages);
		if (!packagesDir.isDirectory()) throw new Error(`Packages directory not found in "${config.packages}"`);

		const
			mainOptions = cla([
				{name: 'command', defaultOption: true}
			], {stopAtFirstUnknown: true}),
			command = mainOptions.command || 'help',
			argv = mainOptions._unknown || []
		;

		const result = await {
			help: async (monorep, argv) => {
				console.log('Help command');
			},
			list: async (monorep, argv) => {
				console.log(
					(await monorep.getPackagesList()).map(({name}) => name)
				);
			},
			info: async (monorep, argv) => {
				const params = cla([
					{name: 'package', defaultOption: true}
				], {argv, stopAtFirstUnknown: true});

				console.log(
					await monorep.getPackage(params.package)
				);
			}
		}[command](new Monorep(config), argv);

		process.exit(0);
	})(config);
}
catch (e) {
	console.error(e);
	process.exit(1);
}
