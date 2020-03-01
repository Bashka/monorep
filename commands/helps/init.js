const {red, yellow} = require('colors');

module.exports = `
${yellow('NAME')}
    init - create monorep config file on current directory.

${yellow('SYNOPSIS')}
    init [--help|-h]

${yellow('OPTIONS')}
    ${red('-h')}, --help
      This help manual.

${yellow('EXAMPLES')}
      $ nodejs index.js init
`;
