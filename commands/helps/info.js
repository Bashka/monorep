const {red, yellow} = require('colors');

module.exports = `
${yellow('NAME')}
    info - show info about package.

${yellow('SYNOPSIS')}
    info <package-name> [--help|-h]

${yellow('OPTIONS')}
    ${red('-h')}, --help
      This help manual.

${yellow('EXAMPLES')}
      $ nodejs index.js info @test/foo
`;
