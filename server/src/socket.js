const Net = require('net')

const sock = new Net.Server()

let id = 0

let display = 'logo'

let switchDisplay = function() {

	display = (display == 'logo' ? 'board' : 'logo')
	Scoreboard.web.io.emit('display', display)

	return display
}

let Competitor = function(socket) {
	this._sock = socket

	this.name = null
	this.id = null
}

setTimeout(() => {
	Scoreboard.shell.updateComp()
}, 500)

Competitor.prototype.onData = function(chunk) {
	let data = chunk.toString()

	let segs = data.split('\n')

	segs.forEach((data) => {
		let parts = data.split('=')

		if(parts[0] == '') { return }

		if(parts[0] == 'name') {
			if(!Scoreboard.scores[parts[1]]) {
				return this.kick('Invalid name')
			}

			this.name = parts[1]
			Scoreboard.scores[this.name].score = 0

			Scoreboard.web.io.emit('score', {
				name: this.name,
				score: 0
			})

			Scoreboard.shell.log(Scoreboard.consts.COUNTRIES[this.name] + ' connected')
			Scoreboard.shell.updateComp()
		}

		if(parts[0] == 'score') {
			Scoreboard.scores[this.name].score = parseFloat(parts[1])

			Scoreboard.shell.log(Scoreboard.consts.COUNTRIES[this.name] + ' scored ' + Scoreboard.scores[this.name].score)
			Scoreboard.shell.updateComp()

			Scoreboard.web.io.emit('score', {
				name: this.name,
				score: parseFloat(parts[1])
			})
		}
	})
}

Competitor.prototype.disconnect = function(err) {
	//console.log('DISCONNECTED', this.id, this.name)

	if(this.name != null) {
		Scoreboard.scores[this.name].score = -1

		Scoreboard.web.io.emit('score', {
			name: this.name,
			score: -1
		})

		Scoreboard.shell.log(Scoreboard.consts.COUNTRIES[this.name] + ' disconnected' + (err ? ' (' + err.message + ')' : ''))
		Scoreboard.shell.updateComp()
	}
}

Competitor.prototype.kick = function(msg) {
	this.write('err=' + msg)
	this._sock.destroy()
}

Competitor.prototype.onEnd = function() {
	this.disconnect()
}

Competitor.prototype.onError = function(err) {
	this.disconnect(err)
	//console.error(this.id, err)
}


sock.on('connection', function(socket) {
	let comp = new Competitor(socket)

	socket.on('data', (chunk) => { comp.onData(chunk) })
	socket.on('end', () => { comp.onEnd() })
	socket.on('error', (err) => { comp.onError(err) })

	socket.write('hi=' + Math.floor(Date.now() / 1000))
})

module.exports = {
	listen: (port) => {
		sock.listen(port, function() {
			//console.log('Socket listening on %i', port)
			Scoreboard.shell.log('Socket listening on ' + port)
		})
	},
	display: () => { return display },
	switchDisplay
}