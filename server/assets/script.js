const COUNTRIES = {"at":"Austria","by":"Belarus","br":"Brazil","ca":"Canada","cn":"China","tpe":"Chinese Taipei","co":"Colombia","cr":"Costa Rica","hr":"Croatia","eg":"Egypt","ee":"Estonia","fr":"France","de":"Germany","hu":"Hungary","id":"Indonesia","ir":"Iran","jp":"Japan","kz":"Kazakhstan","kr":"Korea","li":"Liechtenstein","mo":"Macao, China","om":"Oman","pt":"Portugal","ru":"Russia","sg":"Singapore","za":"South Africa","es":"Spain","se":"Sweden","ch":"Switzerland"}

const mirror = (d) => { Object.keys(d).forEach((k) => d[k] = k) }
mirror(COUNTRIES)

const HEADER = `<li class="header"><div class="rank">Rank</div><div class="flag">&nbsp;</div><div class="name">Player</div><div class="score">Score</div></li>`
let socket = io.connect('')
let scores = [
	{ id: 0, name: 'bob', score: 50, pos: 0 },
	{ id: 1, name: 'tom', score: 60, pos: 0 },
	{ id: 2, name: 'scott', score: 20, pos: 0 }
]

let update = function() {
	document.querySelector('#players').innerHTML = HEADER + scores.map((x) => {
		return '<li class="player" id="pl_' + x.id + '">' +
			'<div class="rank">...</div>' +
			'<div class="flag"><span class="flag-icon flag-icon-gb flag-icon-squared"></span></div>' +
			'<div class="name">' + x.name + '</div>' +
			'<div class="score">' + x.score + '</div>' +
			'</li>'
	}).join('')

	scores.sort(function(a, b) { return b.score - a.score })

	scores.forEach((x, i) => {
		scores[i].pos = i

		document.querySelector('.player#pl_' + x.id).style.top = ((i + 1) * 22) + 'px'
		document.querySelector('.player#pl_' + x.id + ' .rank').innerHTML = i + 1
	})

	console.log(scores)
}

let updateScore = function(id, amt) {
	let user = scores.find(x => x.id == id)
	user.score = amt

	scores.sort(function(a, b) { return b.score - a.score })

	scores.forEach((x, i) => {
		scores[i].pos = i

		document.querySelector('.player#pl_' + x.id).style.top = ((i + 1) * 22) + 'px'
		document.querySelector('.player#pl_' + x.id + ' .rank').innerHTML = i + 1
		document.querySelector('.player#pl_' + x.id + ' .score').innerHTML = x.score
	})
}

socket.on('connect', (data) => {
	console.log('connected', data)
})

socket.on('scores', (data) => {
	console.log('scores', data)
	
	scores = data
	update()
})

socket.on('score', (data) => {
	console.log('score', data)
	
	updateScore(data.id, data.score)
})

socket.on('newscore', (data) => {
	console.log('scores', data)
	
	//this.scores = data
	//update()
})