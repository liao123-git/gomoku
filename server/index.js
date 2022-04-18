const express = require( "express" );
const { createServer } = require( "http" );
const gomoku = require( "./gomoku/index" );

const app = express();
const httpServer = createServer( app );

gomoku.init( httpServer )

httpServer.listen( 3000 );