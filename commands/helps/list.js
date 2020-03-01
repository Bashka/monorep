const {red, yellow} = require('colors');

module.exports = `
${yellow('NAME')}
    list - show list packages.

${yellow('SYNOPSIS')}
    list [--help|-h]

${yellow('OPTIONS')}
    ${red('-h')}, --help
      This help manual.

${yellow('EXAMPLES')}
      $ nodejs index.js list
`;
