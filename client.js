//const term = require( 'terminal-kit' ).terminal;
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

const io = require('socket.io-client');
const socket = io.connect('http://localhost:10101',{
    reconnect:true,
    query:{
        user:options.user,
        node:options.node
    }
});
const readline = require('readline').createInterface({
    input:process.stdin,
    output:process.stdout
});
const colourReset = "\x1b[0m";
let myColour;

function writeOut(message){
    readline.output.clearLine(); //clear this line
    readline.output.cursorTo(0); //back to the start of the line
    readline.output.write(`${message}\n`);
    readline.prompt(true);
}

socket.on('message',(message)=>{
    if(!!message.serverconnect){
        myColour = message.serverconnect.colour;
    }else{
        let u = (!!message.user)?`${message.colour}${message.user}${colourReset}: `:''
        writeOut(`${u}${message.message}`);
    }
});
socket.on('connect', (socket)=>{
    writeOut(`Connected`);
});

readline.on('line',(line)=>{
    if(line[0]=='/'){
        writeOut(`==>${line}`);
        switch(line){
            case '\/q': 
                process.exit;
                break;
        }
    }else{
        socket.emit('message',{user: options.user, node: options.node, message:line});
    }
});

// term.inputField({
//     x:2, y:options.rows-1
// },(err, line)=>{
//     if(!err) socket.emit('message',{user: options.user, node: options.node, message:line});
// });