const
	fs = require('fs'),
	{promises: fsPromises} = require('fs'),
	{neatJSON} = require('neatjson'),
	glob = require('glob')
;

/**
 * @typedef {{
 *     name: string|undefined,
 *     version: string|undefined,
 *     dependencies: Array<{[string]: string}>|undefined
 * }} PackageJson
 */
class Package {
	/**
	 * @params {string} path
	 * @params {Object} packageJson
	 */
	constructor(path, packageJson) {
		this.path = path;
		this.packageJson = packageJson;
	}

	/**
	 * @returns {string}
	 */
	get jsonPath() {
		return `${this.path}/package.json`
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return this.packageJson.name || '';
	}

	/**
	 * @returns {string}
	 */
	get version() {
		return this.packageJson.version || '';
	}

	/**
	 * @params {PackageJson => PackageJson} fn
	 *
	 * @returns {Package}
	 */
	map(fn) {
		return new Package(this.path, fn(this.packageJson));
	}

	/**
	 * @params {PackageJson} json
	 *
	 * @returns {PackageJson}
	 */
	static incPatchVersion = json => {
		const [major, minor, patch] = json.version.split('.');

		return {
			...json,
			version: `${major}.${minor}.${parseInt(patch, 10) + 1}`
		};
	};

	/**
	 * @params {PackageJson} json
	 *
	 * @returns {PackageJson}
	 */
	static incMinorVersion = json => {
		const [major, minor] = json.version.split('.');

		return {
			...json,
			version: `${major}.${parseInt(minor, 10) + 1}.0`
		};
	};

	/**
	 * @params {PackageJson} json
	 *
	 * @returns {PackageJson}
	 */
	static incMajorVersion = json => {
		const [major] = json.version.split('.');

		return {
			...json,
			version: `${parseInt(major, 10) + 1}.0.0`
		};
	};

	/**
	 * @params {Package} d
	 *
	 * @returns {function(PackageJson): PackageJson}
	 */
	static upDependencyVersion = d => json => {
		return {
			...json,
			dependencies: Object.entries((json.dependencies || {})).reduce(
				(dependencies, [dep, v]) => {
					return dep === d.name
					       ? ({
							...dependencies,
							[dep]: d.version
						})
					       : {
							...dependencies,
							[dep]: v
						}
				},
				{}
			)
		};
	};

	/**
	 * @params {Object} options
	 *
	 * @returns {function(Package): Promise<Package>}
	 */
	static save = options => async p => {
		/*
		await fsPromises.writeFile(p.jsonPath, neatJSON(p.packageJson, options));

		return p;
		*/
		console.log(`save start ${p.name}`);
		return new Promise((resolve => setTimeout(() => {
			console.log(`save end ${p.name}`);
			resolve(p)
		}, 100)));
	};

	static commit = options => async p => {
		console.log(`commit start ${p.name}`);
		return new Promise((resolve => setTimeout(() => {
			console.log(`commit end ${p.name}`);
			resolve(p)
		}, 100)));
	};

	static update = async p => {
		console.log(`update start ${p.name}`);
		return new Promise((resolve => setTimeout(() => {
			console.log(`update end ${p.name}`);
			resolve(p)
		}, 100)));
	};

	static publish = async p => {
		console.log(`publish start ${p.name}`);
		return new Promise((resolve => setTimeout(() => {
			console.log(`publish end ${p.name}`);
			resolve(p)
		}, 100)));
	};
}

/**
 * @typedef {{
 *     packages: string
 * }} MonorepConfig
 */
class Monorep {
	/**
	 * @params {MonorepConfig} config
	 * @params {Package[]} packages
	 */
	constructor(config, packages) {
		this.config = config;
		this.packages = packages
	}

	/**
	 * @param {MonorepConfig} config
	 *
	 * @returns {Promise<Monorep>}
	 */
	static async fromConfig(config) {
		return new Monorep(
			config,
			await Promise.all(
				glob.sync(`${config.packages}/*`, {silent: true}).map(async packageDir =>
					new Package(
						packageDir,
						JSON.parse(await fsPromises.readFile(`${packageDir}/package.json`))
					)
				)
			)
		);
	}

	/**
	 * @param {MonorepConfig} config
	 *
	 * @returns {Monorep}
	 */
	static empty(config) {
		return new Monorep(config, []);
	}

	/**
	 * @params {function(Package): boolean} fn
	 *
	 * @returns {Package|undefined}
	 */
	find(fn) {
		return this.packages.find(fn);
	}

	/**
	 * @params {function(Package): Package} fn
	 *
	 * @returns {Monorep}
	 */
	map(fn) {
		return new Monorep(
			this.config,
			this.packages.map(fn)
		)
	}

	/**
	 * @params {function(Package): Package} fn
	 *
	 * @returns {Monorep}
	 */
	flatMap(fn) {
		return new Monorep(
			this.config,
			this.packages.flatMap(fn)
		)
	}

	/**
	 * @params {function(Package): boolean} fn
	 *
	 * @returns {Monorep}
	 */
	filter(fn) {
		return new Monorep(
			this.config,
			this.packages.filter(fn)
		);
	}

	/**
	 * @params {string} n
	 *
	 * @returns {function(Package): boolean}
	 */
	static byName = n => ({name}) => name === n;

	/**
	 * @params {Package} d
	 *
	 * @returns {function(Package): boolean}
	 */
	static dependent = d => p => {
		return Object.keys(p.packageJson.dependencies || {}).includes(d.name);
	};

	/**
	 * @params {Package} d
	 *
	 * @returns {function(Package): boolean}
	 */
	static dependencies = d => p => {
		const dependencies = Object.keys(d.packageJson.dependencies || {});

		return dependencies.includes(p.name);
	};
}

module.exports = {
	Package,
	Monorep
};
