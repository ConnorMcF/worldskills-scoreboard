const Net = require('net')

const sock = new Net.Server()

const path = require('path')

let id = 0

let scores = []

let disconnect = function(name) {
	console.log('DISCONNECTED')

	if(name) {
		scores[name] = null

		console.log(scores)
		io.emit('scores', scores)
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
				id = scores.push({ name: parts[1], score: 0 })
				id = id - 1
				scores[id].id = id
				
				console.log(name + ' connected', id)

				io.emit('scores', scores)
			}

			if(parts[0] == 'score') {
				scores[id].score = parts[1]
				console.log(scores)

				io.emit('score', {
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

sock.listen(12345, function() {
	console.log('Listening')
})

/* express */

const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

app.use('/assets', express.static(path.join(__dirname, 'assets')))

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
})

io.on('connection', function (socket) {
	socket.emit('connect', { hello: 'world' })
	socket.emit('scores', scores)
})

server.listen(80)