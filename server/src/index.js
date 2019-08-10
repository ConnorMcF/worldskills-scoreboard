const opts = require('commander')

opts
	.version('1.0.0')
	.option('-s, --socket <port>', 'socket port', 12345)
	.option('-w, --web <port>', 'web port', 80)
	.option('-I, --no-interact', 'disable interactive mode')
	.parse(process.argv)

const Scoreboard = {}

global.Scoreboard = Scoreboard


// state
Scoreboard.scores = {}
Scoreboard.opts = opts

Scoreboard.consts = require('./consts')

// modules
Scoreboard.shell = require((opts['no-interact'] ? './shell2' : './shell'))
Scoreboard.socket = require('./socket')
Scoreboard.web = require('./web')

// listen
Scoreboard.socket.listen(opts.socket)
Scoreboard.web.listen(opts.web)

