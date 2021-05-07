function startSimplestChatClient(user, node){
    /* ===== Connect to local server ===== */
    const io = require('socket.io-client');
    const socket = io.connect('http://localhost:10101',{
        reconnect:true,
        query:{
            user:user,
            node:node
        }
    });

    /* ===== colour reset ==== */
    const colourReset = "\x1b[0m";

    /* ===== set up UI ===== */
    const blessed = require('blessed');
    let screen, chatBox, inputBox, promptBox;

    screen  = blessed.screen({
        fastCSR:true
    });
    chatBox = blessed.box({
        top:0,
        left:0,
        width:'100%',
        height:screen.height-3,
        scrollable:true,
        border:'line',
        label:'Connecting...'
    });
    screen.append(chatBox);
    inputBox = blessed.textbox({
        top:screen.height-3,
        left:3,
        width:screen.width-1,
        height:1,
        scrollable:false,
        keyable:true,
        inputOnFocus:true,
        keys:['enter']
    });
    screen.append(inputBox);
    inputBox.focus();
    promptBox=blessed.box({
        top:screen.height-3,
        left:0,
        width:3,
        height:1,
        scrollable:false,
        keyable:false,
        clickable:false
    });
    screen.append(promptBox);
    screen.render();

    /* ===== UI Events ===== */
    screen.key('escape', ()=>process.exit(0));
    inputBox.key('escape', ()=>process.exit(0));
    inputBox.on('submit', ()=>{
        //send message to server
        socket.emit('message',{message:inputBox.value});
        inputBox.clearValue();
        inputBox.readInput();
        screen.render();
    });

    /* ===== network events ===== */
    socket.on('message',(message)=>{
        let u = (!!message.user)?`${message.colour}${message.user}${colourReset}: `:''
        chatBox.pushLine(`${u}${message.message}`);
        chatBox.setScrollPerc(100) 
        screen.render();
    });

    socket.on('serverconnect', srv=>{
        chatBox.setLabel(srv.title || 'BBS Chat');
        promptBox.setContent(`${srv.colour}=>${colourReset}`);
        screen.render();
    });
}

module.exports = startSimplestChatClient;