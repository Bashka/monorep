const
	cla = require('command-line-args'),
  fs = require('fs'),
  {promises: fsPromises} = fs,
  {initHelp} = require('./helps')
;

module.exports = async (monorep, argv) => {
	const params = cla([
		{name: 'help', alias: 'h', type: Boolean, defaultValue: false}
	], {argv, stopAtFirstUnknown: true});
  initHelp(params);

  if (fs.existsSync('./monorep.json')) return;

  await fsPromises.writeFile('./monorep.json', `{
	"glob": {
		"search": "packages/**/package.json",
		"ignore": ["packages/**/node_modules/**/package.json"]
	}
}`);

  process.exit(0);
};
