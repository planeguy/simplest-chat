
/* ===== Get command line options ===== */
const {Command} = require('commander');
const program = new Command();
program.version('0.0.1');

program
    .option('-u, --user <user>', 'user name')
    .option('-n, --node <node>', 'node')

program.parse(process.argv);
const options = program.opts();

const { SimplestChatClient } = require('./SimplestChatClient.js');
//console.log('>>>', SimplestChatClient)
//process.exit(0);

const blessed = require('blessed');
const resetColour = "\x1b[0m";

//yes, we could extend, but as an example for
// how the enigma mod works, we will use composition
class StandaloneClient{
    constructor(opts){
        
        this.chatClient = new SimplestChatClient(options);
        this.setUpBlessedView();
        this.setupUIEvents();
        this.setupNetworkEvents()
    }

    setUpBlessedView(){
        this.screen  = blessed.screen({
            fastCSR:true
        });
        this.chatBox = blessed.box({
            top:0,
            left:0,
            width:'100%',
            height:this.screen.height-3,
            scrollable:true,
            border:'line',
            label:'Connecting...'
        });
        this.screen.append(this.chatBox);
        this.inputBox = blessed.textbox({
            top:this.screen.height-3,
            left:3,
            width:this.screen.width-1,
            height:1,
            scrollable:false,
            keyable:true,
            inputOnFocus:true,
            keys:['enter']
        });
        this.screen.append(this.inputBox);
        this.inputBox.focus();
        this.promptBox=blessed.box({
            top:this.screen.height-3,
            left:0,
            width:3,
            height:1,
            scrollable:false,
            keyable:false,
            clickable:false
        });
        this.screen.append(this.promptBox);
    }

    setupUIEvents(){
        this.screen.key('escape', ()=>process.exit(0));
        this.inputBox.key('escape', ()=>process.exit(0));
        this.inputBox.on('submit', ()=>{
            //send message to server
            this.chatClient.socket.emit('message',{message:this.inputBox.value});
            this.inputBox.clearValue();
            this.inputBox.readInput();
            this.screen.render();
        });
    }

    setupNetworkEvents(){
        this.chatClient.socket.on('message',(message)=>{
            let u = (!!message.user)?`${message.colour}${message.user}${resetColour}: `:''
            this.chatBox.pushLine(`${u}${message.message}`);
            this.chatBox.setScrollPerc(100) 
            this.screen.render();
        });
    
        this.chatClient.socket.on('serverconnect', srv=>{
            this.chatBox.setLabel(srv.title || 'BBS Chat');
            this.promptBox.setContent(`${srv.colour}=>${resetColour}`);
            this.screen.render();
        });
    }
}

let client = new StandaloneClient();