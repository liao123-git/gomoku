const util = {};

util.sendMessage = function ( userList, event, data, err = false ) {
    if ( err ) err.emit( event, data )

    // 1 给房间内所有人发送
    for ( let nickname in userList ) {
        const client = userList[nickname]
        client.emit( event, data )
    }
}

module.exports = util