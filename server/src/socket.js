const Net = require('net')

const sock = new Net.Server()

let id = 0

let disconnect = function(name) {
	console.log('DISCONNECTED')

	if(name) {
		Scoreboard.scores[name] = null

		console.log(Scoreboard.scores)
		Scoreboard.web.io.emit('scores', Scoreboard.scores)
	}
}

sock.on('connection', function(socket) {
	console.log('CONNECTED')

	let name = null
	let id = null

	socket.on('data', function(chunk) {
		let data = chunk.toString()

		let segs = data.split('\n')
		segs.forEach((data) => {
			let parts = data.split('=')

			if(parts[0] == '') { return }

			console.log(parts)

			if(parts[0] == 'name') {
				id = Scoreboard.scores.push({ name: parts[1], score: 0 })
				id = id - 1
				Scoreboard.scores[id].id = id
				
				console.log(name + ' connected', id)

				Scoreboard.web.io.emit('scores', Scoreboard.scores)
			}

			if(parts[0] == 'score') {
				Scoreboard.scores[id].score = parts[1]
				console.log(Scoreboard.scores)

				Scoreboard.web.io.emit('score', {
					id,
					score: parts[1]
				})
			}
		})
	})



	socket.on('end', function() {
		if(name) { disconnect(name) }
	})

	socket.on('error', function(err) {
		if(name) { disconnect(name) }
		console.error(err)
	})

	socket.write('hi')
})

module.exports = {
	listen: (port) => {
		sock.listen(port, function() {
			console.log('Socket listening on %i', port)
		})
	}
}