const { Server } = require( "socket.io" );
const util = require( "./util.js" );
const room = require( "./room.js" );
// const board = require( "./board.js" );
const user = require( "./user.js" );


const gomoku = {}

gomoku.init = function ( httpServer ) {
    this.io = new Server( httpServer, {
        cors: true
    } );

    util.io = this.io

    this.ioListen()

    console.log( 'WebSocket server running......' )
}

gomoku.ioListen = function () {
    this.io.on( "connection", ( socket ) => {
        // ...

        user.login( socket )
        user.message( socket )
        user.exit( socket )

        room.start( socket )
        room.fall( socket )
        room.undo( socket )
        room.admitDefeat( socket )
        room.draw( socket )

    } );
}

module.exports = gomoku