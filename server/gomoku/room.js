const Board = require( "./board.js" );
const util = require( "./util.js" );

const room = {
    roomList: {}
}

room.getRoom = function ( roomID ) {
    return this.roomList[roomID]
}

room.initRoom = function ( roomID ) {
    this.roomList[roomID] = {
        userList: {},
        board: new Board(),
    }
    return this.roomList[roomID]
}

room.getUser = function ( roomID, nickname ) {
    return this.roomList[roomID].userList[nickname]
}

room.setUser = function ( roomID, nickname, value ) {
    this.roomList[roomID].userList[nickname] = value
    return this.roomList[roomID].userList[nickname]
}

room.userExit = function ( roomID, nickname ) {
    delete this.roomList[roomID].userList[nickname]
    if ( !Object.keys( this.roomList[roomID].userList ).length ) delete this.roomList[roomID]
    else this.roomList[roomID].board.init()

    return this.roomList[roomID]
}

room.start = function ( socket ) {

    socket.on( 'start', function ( msg ) {

        const { roomID, nickname } = socket
        const roomData = room.getRoom( roomID )
        let isAllStarted = false

        socket.isStarted = true

        if ( Object.keys( roomData.userList ).length >= 2 ) {
            isAllStarted = true
            for ( let nickname in roomData.userList ) {
                if ( !roomData.userList[nickname].isStarted ) {
                    isAllStarted = false
                }
            }
        }

        if ( isAllStarted ) {
            roomData.board.init()
            roomData.board.start( roomData.userList )
            for ( let nickname in roomData.userList ) {
                roomData.userList[nickname].isStarted = false
                roomData.userList[nickname].undoNumber = 3
                roomData.userList[nickname].canDraw = true
            }
            util.sendMessage( roomData.userList, 'waiting', { nickname: socket.nickname } )
            util.sendMessage( roomData.userList, 'start', { board: roomData.board } )
        } else {
            util.sendMessage( roomData.userList, 'waiting', { nickname: socket.nickname } )
        }

    } )

}

room.fall = function ( socket ) {
    socket.on( 'fall', function ( msg ) {

        const { roomID, nickname } = socket
        const roomData = room.getRoom( roomID )

        if ( roomData.board.players[roomData.board.whoTurn] === nickname ) {
            roomData.board.fall( msg.point )
            util.sendMessage( roomData.userList, 'fall', { ...msg, board: roomData.board } )
            roomData.board.end && util.sendMessage( roomData.userList, 'end', {
                type: roomData.board.win ? 'win' : 'draw',
                board: roomData.board
            } )
        }

    } )
}

room.undo = function ( socket ) {
    socket.on( 'askUndo', function ( msg ) {

        const { roomID, nickname } = socket
        const roomData = room.getRoom( roomID )
        const rival = roomData.userList[roomData.board.players[roomData.board.whoTurn]]

        if ( rival.nickname !== nickname && roomData.board.pieceList.length ) {
            if ( rival.undoNumber <= 0 ) return util.sendMessage( [], 'failed', { msg: '没有悔棋次数了' }, socket )
            return util.sendMessage( roomData.userList, 'askUndo', { rival: rival.nickname, ask: nickname } )
        } else {
            return util.sendMessage( [], 'failed', { msg: '当前回合无法悔棋' }, socket )
        }

    } )

    socket.on( 'undo', function ( msg ) {

        const { roomID, nickname } = socket
        const roomData = room.getRoom( roomID )

        if ( roomData.board.pieceList.length ) {
            roomData.userList[msg.rival].undoNumber--
            if ( msg.agree ) roomData.board.undo()
            util.sendMessage( roomData.userList, 'undo', {
                ...msg,
                board: roomData.board,
                undoNumber: roomData.userList[msg.rival].undoNumber
            } )
        } else {
            return util.sendMessage( [], 'failed', { msg: '当前回合无法悔棋' }, socket )
        }

    } )
}

room.admitDefeat = function ( socket ) {

    socket.on( 'admitDefeat', function ( msg ) {

        const { roomID, nickname } = socket
        const roomData = room.getRoom( roomID )

        roomData.board.boardEnd()

        util.sendMessage( roomData.userList, 'end', {
            type: 'admitDefeat', ...msg,
            board: roomData.board,
            loser: socket.nickname
        } )

    } )
}

room.draw = function ( socket ) {
    socket.on( 'askDraw', function ( msg ) {

        const { roomID, nickname } = socket
        const roomData = room.getRoom( roomID )
        const rival = roomData.board.players[roomData.board.players[0] === socket.nickname]

        if ( rival !== nickname && socket.canDraw ) {
            socket.canDraw = false
            return util.sendMessage( roomData.userList, 'askDraw', {
                rival,
                ask: nickname,
                canDraw: socket.canDraw
            } )
        } else {
            return util.sendMessage( [], 'failed', { msg: '当前回合无法和棋' }, socket )
        }

    } )

    socket.on( 'draw', function ( msg ) {

        const { roomID, nickname } = socket
        const roomData = room.getRoom( roomID )

        if ( msg.agree ) roomData.board.boardEnd()
        util.sendMessage( roomData.userList, 'draw', {
            ...msg,
            board: roomData.board,
        } )

    } )
}

module.exports = room