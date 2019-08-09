const Net = require('net')

const sock = new Net.Server()

let id = 0

let Competitor = function(socket) {
	this.name = null
	this.id = null
}

Competitor.prototype.onData = function(chunk) {
	let data = chunk.toString()

	let segs = data.split('\n')

	segs.forEach((data) => {
		let parts = data.split('=')

		if(parts[0] == '') { return }

		if(parts[0] == 'name') {
			let id = Scoreboard.scores.push({ name: parts[1], score: 0 })
			this.id = id - 1

			Scoreboard.scores[this.id].id = this.id

			this.name = parts[1]
			
			console.log(this.name + ' connected', id)

			//Scoreboard.web.io.emit('scores', Scoreboard.scores)
			Scoreboard.web.io.emit('score', {
				name: this.name,
				score: 0
			})
		}

		if(parts[0] == 'score') {
			Scoreboard.scores[this.id].score = parseFloat(parts[1])
			console.log(Scoreboard.scores)

			Scoreboard.web.io.emit('score', {
				name: this.name,
				score: parseFloat(parts[1])
			})
		}
	})
}

Competitor.prototype.clearTheThingPLS = function() {
	console.log('DISCONNECTED', this.id, this.name)

	if(this.id != null) {
		//Scoreboard.scores[this.id] = null

		Scoreboard.scores.splice(this.id)
		console.log('removing?', this.id)

		console.log(Scoreboard.scores)
		//Scoreboard.web.io.emit('scores', Scoreboard.scores)

		Scoreboard.web.io.emit('score', {
			name: this.name,
			score: -1
		})
	}
}

Competitor.prototype.onEnd = function() {
	this.clearTheThingPLS()
}

Competitor.prototype.onError = function(err) {
	this.clearTheThingPLS()
	console.error(this.id, err)
}


sock.on('connection', function(socket) {
	let comp = new Competitor(socket)

	socket.on('data', (chunk) => { comp.onData(chunk) })
	socket.on('end', () => { comp.onEnd() })
	socket.on('error', (err) => { comp.onError(err) })

	socket.write('hi')
})

module.exports = {
	listen: (port) => {
		sock.listen(port, function() {
			console.log('Socket listening on %i', port)
		})
	}
}