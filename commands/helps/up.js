const {red, yellow} = require('colors');

module.exports = `
${yellow('NAME')}
    up - update version package and dependencies

${yellow('SYNOPSIS')}
    up <package-name> [--help|-h] [--version|-v <mode>] [--commit-message|-m <message>] [--no-all] [--no-save] [--no-update] [--no-pretty] [--no-publish] [--no-commit] [--no-push]

${yellow('OPTIONS')}
    ${red('-h')}, --help
      This help manual.

    ${red('-v')} <mode>, --version=<mode>
      Set version up mode: major, minor or patch.
      
    ${red('-m')} <message>, --commit-message <message>
      Set commit message.

    ${red('--no-all')}
      Disable all updates.

    ${red('--no-save')}
      Disable save updates packages.
      
    ${red('--no-update')}
      Disable "npm install" for updates packages.
      
    ${red('--no-pretty')}
      Disable prettify pacakge.json file after update.

    ${red('--no-publish')}
      Disable "npm publish" for updates packages.

    ${red('--no-commit')}
      Disable "git commit" for updates packages.
      
    ${red('--no-push')}
      Disable "git push" for updates packages.

${yellow('EXAMPLES')}
    For update minor version for all dependencies packages with @test/foo package use:
      
      $ nodejs index.js up @test/foo -v minor

    For show new version for all dependencies packages with @test/foo package use:

      $ nodejs index.js up @test/foo -v minor --no-all
`;
