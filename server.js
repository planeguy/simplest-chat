const Koa = require('koa');
const IO = require('koa-socket-2');

const app = new Koa();
const io = new IO();

const colours = {
    Reset : "\x1b[0m",
    Bright : "\x1b[1m",
    Dim : "\x1b[2m",
    Underscore : "\x1b[4m",
    Blink : "\x1b[5m",
    Reverse : "\x1b[7m",
    Hidden : "\x1b[8m",

    FgBlack : "\x1b[30m",
    FgRed : "\x1b[31m",
    FgGreen : "\x1b[32m",
    FgYellow : "\x1b[33m",
    FgBlue : "\x1b[34m",
    FgMagenta : "\x1b[35m",
    FgCyan : "\x1b[36m",
    FgWhite : "\x1b[37m",

    BgBlack : "\x1b[40m",
    BgRed : "\x1b[41m",
    BgGreen : "\x1b[42m",
    BgYellow : "\x1b[43m",
    BgBlue : "\x1b[44m",
    BgMagenta : "\x1b[45m",
    BgCyan : "\x1b[46m",
    BgWhite : "\x1b[47m"
}
const usercolours = [
    "\x1b[31m",
    "\x1b[32m",
    "\x1b[33m",
    "\x1b[34m",
    "\x1b[35m",
    "\x1b[36m",
]
let users = {};

io.attach(app);

io.on('connect', (ctx, data)=>{
    //record the socket-user
    users[ctx.id]={
        user:ctx.handshake.query.user,
        node:ctx.handshake.query.node,
        colour: usercolours[Math.floor(Math.random() * usercolours.length)]
    };
    io.broadcast('message',{
        message: `${users[ctx.id].colour}${ctx.handshake.query.user}${colours.Reset} on node ${ctx.handshake.query.node} has arrived!`
    });
    ctx.emit('message', {
        serverconnect:{
            colour: users[ctx.id].colour
        }
    });
});

io.on('message', (ctx, data)=>{
    //announce the message to the rest of the room
    console.log(`${users[ctx.socket.id].user}: ${data.message}`);
    //io.broadcast
    ctx.socket.broadcast.emit('message',{
        user: users[ctx.socket.id].user, 
        node: users[ctx.socket.id].node, 
        colour: users[ctx.socket.id].colour, 
        message:`${data.message}`
    });
});

io.on('disconnect', (ctx, data)=>{
    //announce the chatter departure
    io.broadcast('message',{
        message:`${users[ctx.socket.id].user} has left.`
    });
    console.log(`${users[ctx.socket.id].user} has left.`);
    delete users[ctx.socket.id];
});

app.listen(process.env.PORT||10101);