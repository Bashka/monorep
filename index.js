const
  fs = require('fs'),
	cla = require('command-line-args'),
	{red} = require('colors'),
	{Monorep} = require('./monorep'),
	commands = require('./commands'),
	{RuntimeError} = require('./lib/error')
;

(async(config) => {
	config = {
		glob: {
      search: 'packages/**/package.json',
      ignore: ['packages/**/node_modules/**/package.json']
    },
		...config
	};

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
    await commandHandler(monorep, argv)
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
})(fs.existsSync('./monorep.json') ? require('./monorep.json') : {});
