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
	},
	"pretty": {
		"wrap"         : 0,
		"sort"         : 1,
		"indent"       : "\t",
		"aligned"      : true,
		"objectPadding": 1,
		"afterComma"   : 1,
		"afterColonN"  : 1
	},
	"exec": {
		"add"    : "git add -A",
		"commit" : "git commit -a --allow-empty-message",
		"push"   : "git push",
		"update" : "npm install",
		"publish": "npm publish"
	}
}`);

  process.exit(0);
};
