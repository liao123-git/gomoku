class Board {
    constructor () {
        this.row = 15
        this.colum = 15
        this.init()
    }

    init () {
        this.win = false
        this.whoTurn = 1
        this.end = false
        this.pieceList = []
        this.players = {}
        this.now = []
        this.last = []
        // 1 为黑棋    2 为白棋
        this.board = new Array( this.row ).fill( null ).map( item => new Array( this.colum ).fill( 0 ) )
    }

    start ( userList ) {
        let arr = Object.keys( userList )
        this.players[1] = arr.splice( ~~(Math.random() * arr.length), 1 )[0]
        this.players[2] = arr[0]
    }

    fall ( [ i, j ] ) {
        if ( this.inArea( i, j ) ) {
            this.board[i][j] = this.whoTurn
            this.pieceList.push( [ i, j ] )
            this.now = i + '' + j
            if ( this.pieceList.length > 8 && this.isWin() ) {
                this.boardEnd()
            }
            if ( this.pieceList.length >= this.row * this.colum ) {
                this.boardEnd( false )
            }
            this.whoTurn = this.whoTurn === 1 ? 2 : 1
        }
    }

    undo () {
        const [ i, j ] = this.pieceList.pop()
        this.board[i][j] = 0
        this.last = [ i, j ]
        this.whoTurn = this.whoTurn === 1 ? 2 : 1
        this.now = ''
        if ( this.pieceList.length ) this.now = this.pieceList[this.pieceList.length - 1][0] + '' + this.pieceList[this.pieceList.length - 1][1]
    }

    boardEnd ( win = true ) {
        this.now = ''
        this.win = win
        this.end = true
    }

    inArea ( i, j ) {
        return i >= 0 && j >= 0 && i < this.row && j < this.colum
    }

    isWin () {
        for ( let k = 0; k < this.pieceList.length; k++ ) {
            const [ i, j ] = this.pieceList[k]
            if ( i <= 15 - 2 || j <= 15 - 2 ) {
                let str = ""

                for ( let dirI = -2; dirI < 3; dirI++ ) {
                    for ( let dirJ = -2; dirJ < 3; dirJ++ ) {
                        const newI = i + dirI
                        const newJ = j + dirJ

                        if ( newI >= 15 || newJ >= 15 || newI < 0 || newJ < 0 ) {
                            str += '0'
                        } else {
                            str += this.board[newI][newJ]
                        }
                    }
                    str += ','
                }

                if ( /11111|1.....1.....1.....1.....1|1......1......1......1......1|1....1....1....1....1/.test( str ) ) return 1
                if ( /22222|2.....2.....2.....2.....2|2......2......2......2......2|2....2....2....2....2/.test( str ) ) return 2
            }
        }

        return false
    }
}

module.exports = Board

