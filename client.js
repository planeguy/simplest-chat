
/* ===== Get command line options ===== */
const {Command} = require('commander');
const program = new Command();
program.version('0.0.1');

program
    .option('-u, --user <user>', 'user name')
    .option('-n, --node <node>', 'node')
    .option('-r, --rows <rows>', 'screen rows', 8)
    .option('-c, --cols <cols>', 'screen columns', 40);

program.parse(process.argv);
const options = program.opts();

const startClient = require('./client-function.js');
startClient(options.user, options.node);