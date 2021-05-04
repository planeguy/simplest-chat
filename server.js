/* ===== command line options ==== */
const {Command} = require('commander');
const program = new Command();
program.version('0.0.1');

program
    .option('-t, --title <title>', 'chat title', 'Simplest Chat')

program.parse(process.argv);
const options = program.opts();

/* ===== set up service ===== */
const Koa = require('koa');
const IO = require('koa-socket-2');

const app = new Koa();
const io = new IO();

/* ===== colours stuff ===== */
const resetColour = "\x1b[0m";
const usercolours = [
    "\x1b[31m",
    "\x1b[32m",
    "\x1b[33m",
    "\x1b[34m",
    "\x1b[35m",
    "\x1b[36m",
];

/* ===== user list ===== */
let users = {};

/* ===== network events ===== */
io.attach(app);

io.on('connect', (ctx, data)=>{
    //record the socket-user
    users[ctx.id]={
        user:ctx.handshake.query.user,
        node:ctx.handshake.query.node,
        colour: usercolours[Math.floor(Math.random() * usercolours.length)]
    };
    //tell everyone they've arrived
    io.broadcast('message',{
        message: `${users[ctx.id].colour}${ctx.handshake.query.user}${resetColour} on node ${ctx.handshake.query.node} has arrived!`
    });
    //send the user server information
    ctx.emit('serverconnect', {
        colour: users[ctx.id].colour,
        title: options.title
    });
});

io.on('message', (ctx, data)=>{
    //send the message to all users including the sendre (so it shows up in their chat list)
    io.broadcast('message',{
        user: users[ctx.socket.id].user, 
        node: users[ctx.socket.id].node, 
        colour: users[ctx.socket.id].colour, 
        message:`${data.message}`
    });
});

io.on('disconnect', (ctx, data)=>{
    //announce the user's departure
    io.broadcast('message',{
        message:`${users[ctx.socket.id].user} has left.`
    });
    // remove the user from the list
    delete users[ctx.socket.id];
});


// ===== START SERVER =====
app.listen(10101);