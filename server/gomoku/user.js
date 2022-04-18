const room = require( "./room.js" );
const util = require( "./util.js" );

const user = {}

user.login = function ( socket ) {
    socket.on( 'login', function ( msg ) {

        const { roomID, nickname } = msg
        const roomData = room.getRoom( roomID ) || room.initRoom( roomID )

        // 重名判断
        if ( room.getUser( roomID, nickname ) ) {
            return util.sendMessage( [], 'failed', { msg: '改名字已被使用' }, socket )
        }
        // 人数判断
        if ( Object.keys( roomData.userList ).length >= 2 ) {
            return util.sendMessage( [], 'failed', { msg: '该房间已经满了' }, socket )
        }

        room.setUser( roomID, nickname, socket )
        util.sendMessage( roomData.userList, 'login', {
            ...msg,
            playersNumber: Object.keys( roomData.userList ).length
        } )
        socket.nickname = nickname
        socket.roomID = roomID

    } )
}

user.message = function ( socket ) {
    socket.on( 'message', function ( msg ) {

        const { roomID, nickname } = msg
        const roomData = room.getRoom( roomID )

        util.sendMessage( roomData.userList, 'message', {
            ...msg,
        } )

    } )
}

user.exit = function ( socket ) {
    socket.on( 'disconnect', function ( msg ) {

        const { roomID, nickname } = socket
        const roomData = room.getRoom( roomID )

        if ( nickname && room.getUser( roomID, nickname ) && room.userExit( roomID, nickname ) ) {
            for ( let nickname in roomData.userList ) {
                roomData.userList[nickname].isStarted = false
            }

            util.sendMessage( roomData.userList, 'exit', { nickname } )
        }

    } )
}

module.exports = user

