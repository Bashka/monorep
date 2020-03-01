const help = message => params => {
  if (!params['help']) return
  console.log(message);
  process.exit(0);
};

module.exports = {
  initHelp: help(require('./init')),
  listHelp: help(require('./list')),
  infoHelp: help(require('./info')),
  upHelp  : help(require('./up')),
};
