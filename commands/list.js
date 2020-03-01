const
	cla = require('command-line-args'),
	{blue} = require('colors'),
	{compose, prop} = require('../lib/fp'),
	{list, nl} = require('../lib/view'),
  {listHelp} = require('./helps')
;

module.exports = async (monorep, argv) => {
	const params = cla([
		{name: 'help', alias: 'h', type: Boolean, defaultValue: false}
	], {argv, stopAtFirstUnknown: true});
  listHelp(params);

  console.log(
    monorep.packages
      .map(compose(list, p => `${blue(p.name)} ${p.version}`))
      .join(nl)
  );
  process.exit(0);
};
