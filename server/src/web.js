const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

const path = require('path')

app.use('/assets', express.static(path.join(__dirname, '../assets')))

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/web.html');
})

io.on('connection', function (socket) {
	socket.emit('connect', { hello: 'world' })
	socket.emit('scores', Scoreboard.scores)
	socket.emit('display', Scoreboard.socket.display())
})

module.exports = {
	io,
	listen: (port) => {
		server.listen(port, function() {
			//console.log('Web listening on %i', port)
			Scoreboard.shell.log('Web listening on ' + port)
		})
	}
}