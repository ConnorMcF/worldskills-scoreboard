const opts = require('commander')

opts
	.version('1.0.0')
	.option('-s, --socket <port>', 'socket port', 12345)
	.option('-w, --web <port>', 'web port', 80)
	.parse(process.argv)

const Scoreboard = {}

// state
Scoreboard.scores = []
Scoreboard.opts = opts

// modules
Scoreboard.socket = require('./socket')
Scoreboard.web = require('./web')

// listen
Scoreboard.socket.listen(opts.socket)
Scoreboard.web.listen(opts.web)

global.Scoreboard = Scoreboard
