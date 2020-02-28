const
	fs = require('fs'),
	{promises: fsPromises} = require('fs'),
	cla = require('command-line-args'),
	{red} = require('colors'),
	config = require('./monorep.json'),
	{Monorep} = require('./monorep'),
	commands = require('./commands'),
	{RuntimeError} = require('./lib/error')
;

(async(config) => {
	config = {
		packages: 'packages',
		...config
	};

	if (!await fs.existsSync(config.packages)) return console.error(`Packages directory not found in "${config.packages}"`);

	const packagesDir = await fsPromises.lstat(config.packages);
	if (!packagesDir.isDirectory()) return console.error(`Packages directory not found in "${config.packages}"`);

	const
		mainOptions = cla([
			{name: 'command', defaultOption: true}
		], {stopAtFirstUnknown: true}),
		command = mainOptions.command || 'help',
		argv = mainOptions._unknown || [],
		monorep = await Monorep.fromConfig(config),
		commandHandler = commands[command]
	;
	if (commandHandler === undefined) return console.error(`Undefined command "${command}"`);

	try {
		console.log(
			await commandHandler(monorep, argv)
		);
	}
	catch(e) {
		if (e instanceof RuntimeError) {
			console.error(red(`Error: ${e.message}`));
		}
		else {
			console.log(e.stack)
		}
		process.exit(1);
	}

	//process.exit(0);
})(config);
