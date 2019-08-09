const CONFIG = {
	demoMode: true
}

const COUNTRIES = {"at":"Austria","by":"Belarus","br":"Brazil","ca":"Canada","cn":"China","tpe":"Chinese Taipei","co":"Colombia","cr":"Costa Rica","hr":"Croatia","eg":"Egypt","ee":"Estonia","fr":"France","de":"Germany","hu":"Hungary","id":"Indonesia","ir":"Iran","jp":"Japan","kz":"Kazakhstan","kr":"Korea","li":"Liechtenstein","mo":"Macao, China","om":"Oman","pt":"Portugal","ru":"Russia","sg":"Singapore","za":"South Africa","es":"Spain","se":"Sweden","ch":"Switzerland"}

const HEADER = ``//`<li class="header"><div class="rank">Rank</div><div class="flag">&nbsp;</div><div class="name">Player</div><div class="score">Score</div></li>`
let socket = io.connect('')
let scores = [
	{ id: 0, name: 'bob', score: 50, pos: 0 },
	{ id: 1, name: 'tom', score: 60, pos: 0 },
	{ id: 2, name: 'scott', score: 20, pos: 0 },
	{ id: 3, name: 'john', score: 20, pos: 0 },
]

let flagOverride = {
	'tpe': 'cn'
}

let countryFont = {
	'tpe': 'tpe-hack',
	'mo': 'mo-hack'
}

scores = [{"id":0,"name":"at","score":0,"pos":0},{"id":1,"name":"by","score":0,"pos":0},{"id":2,"name":"br","score":0,"pos":0},{"id":3,"name":"ca","score":0,"pos":0},{"id":4,"name":"cn","score":0,"pos":0},{"id":5,"name":"tpe","score":0,"pos":0},{"id":6,"name":"co","score":0,"pos":0},{"id":7,"name":"cr","score":0,"pos":0},{"id":8,"name":"hr","score":0,"pos":0},{"id":9,"name":"eg","score":0,"pos":0},{"id":10,"name":"ee","score":0,"pos":0},{"id":11,"name":"fr","score":0,"pos":0},{"id":12,"name":"de","score":0,"pos":0},{"id":13,"name":"hu","score":0,"pos":0},{"id":14,"name":"id","score":0,"pos":0},{"id":15,"name":"ir","score":0,"pos":0},{"id":16,"name":"jp","score":0,"pos":0},{"id":17,"name":"kz","score":0,"pos":0},{"id":18,"name":"kr","score":0,"pos":0},{"id":19,"name":"li","score":0,"pos":0},{"id":20,"name":"mo","score":0,"pos":0},{"id":21,"name":"om","score":0,"pos":0},{"id":22,"name":"pt","score":0,"pos":0},{"id":23,"name":"ru","score":0,"pos":0},{"id":24,"name":"sg","score":0,"pos":0},{"id":25,"name":"za","score":0,"pos":0},{"id":26,"name":"es","score":0,"pos":0},{"id":27,"name":"se","score":0,"pos":0},{"id":28,"name":"ch","score":0,"pos":0}]
scores.forEach((x) => { x.score = -1 })//Math.random() * 100 })

let update = function() {
	document.querySelector('#players').innerHTML = HEADER + scores.map((x) => {
		return '<li class="player" hack="' + (countryFont[x.name] ? countryFont[x.name] : '') + '" id="pl_' + x.id + '">' +
			'<div class="rank"></div>' +
			'<div class="flag"><span class="flag-icon flag-icon-' + (flagOverride[x.name] ? flagOverride[x.name] : x.name) + '"></span></div>' +
			'<div class="name">' + COUNTRIES[x.name] + '</div>' +
			'<div class="score"></div>' +
			'</li>'
	}).join('')

	scores.sort(function(a, b) { return b.score - a.score })

	scores.forEach((x, i) => {
		scores[i].pos = i

		let pos = calcPos(i)
		document.querySelector('.player#pl_' + x.id).style['top'] = pos[0]
		document.querySelector('.player#pl_' + x.id).style['left'] = pos[1]

		document.querySelector('.player#pl_' + x.id + ' .rank').innerHTML = i + 1
	})

	console.log(scores)
}

let calcPos = function(i) {

	// total leader width 1540
	// total width 1700
	// 1700 - 1040 = 160 / 2 = 80

	
	let start = 3

	if(i < 3) {
		if(i == 0) { return [120, 0 + 0 + 80] }
		if(i == 1) { return [120, 480 + 40 + 80] }
		if(i == 2) { return [120, 960 + 80 + 80] }
	}

	let seg = Math.floor((i - 3) / 9)

	const HEIGHT = 75
	const HEIGHTPAD = 300

	if(seg == 0) {
		let h = (i - 3) * HEIGHT
		return [h + HEIGHTPAD, 0 + 140]
	}

	if(seg == 1) {
		let h = (i - 12) * HEIGHT
		return [h + HEIGHTPAD, 500 + 140]
	}

	if(seg == 2) {
		let h = (i - 21) * HEIGHT
		return [h + HEIGHTPAD, 1000 + 140]
	}

	if(seg == 3) {
		let h = (i - 24) * HEIGHT
		return [h + HEIGHTPAD, 1500 + 140]
	}

	/*if(seg == 1) {
		let w = (i - 3) * 426
		return [250, w]
	}
	if(seg == 2) {
		let w = (i - 7) * 426
		return [350, w]
	}
	if(seg == 3) {
		let w = (i - 11) * 426
		return [450, w]
	}
	if(seg == 4) {
		let w = (i - 15) * 426
		return [550, w]
	}
	if(seg == 5) {
		let w = (i - 19) * 426
		return [650, w]
	}
	if(seg == 6) {
		let w = (i - 23) * 426
		return [750, w]
	}
	if(seg == 7) {
		let w = (i - 27) * 426
		return [850, w]
	}*/


	return [((i) * (48 + 5)) + 500, 0]
	/*if(i == 0) { return [((i) * 48) + 0, 500] }
	if(i == 1) { return [((i) * 48) + 30, 200] }
	if(i == 2) { return [((i) * 48) + 30, 200] }
	if(i == 3) { return [((i) * 48) + 30, 200] }

	return [((i) * (48 + 5)) + 30, 0]*/
}

let updateScore = function(name, amt) {
	let user = scores.find(x => x.name == name)
	user.score = amt

	scores.sort(function(a, b) { return b.score - a.score })

	scores.forEach((x, i) => {
		x.oldPos = x.pos
		x.displayPos = x.pos + 1

		scores[i].pos = i

		document.querySelector('.player#pl_' + x.id).style['transition'] = 'box-shadow 0s, top 1s, left 1s, font-size 1s'

		if(x.pos != x.oldPos && x.score !== 0) {
			if(x.pos > x.oldPos) {
				document.querySelector('.player#pl_' + x.id).classList = 'player down'
			} else {
				document.querySelector('.player#pl_' + x.id).classList = 'player up'
			}
		}

		setTimeout(() => {
			document.querySelector('.player#pl_' + x.id).style['transition'] = 'box-shadow 2s, top 1s, left 1s, font-size 1s'
			document.querySelector('.player#pl_' + x.id).classList = 'player pos' + i
		}, 200)

		document.querySelector('.player#pl_' + x.id).style['z-index'] = i + 100

		let pos = calcPos(i)
		document.querySelector('.player#pl_' + x.id).style['top'] = pos[0] + 'px'
		document.querySelector('.player#pl_' + x.id).style['left'] = pos[1] + 'px'

		document.querySelector('.player#pl_' + x.id + ' .rank').innerHTML = (x.score == -1 ? '' : x.displayPos)
		document.querySelector('.player#pl_' + x.id + ' .score').innerHTML = (x.score == -1 ? '' : x.score.toFixed(1) + '%')
	})
}

socket.on('connect', (data) => {
	console.log('connected', data)
})

socket.on('scores', (data) => {
	console.log('scores', data)

	update()

	setTimeout(() => {
		data.forEach((x) => {
			updateScore(x.name, parseFloat(x.score))
		})
	}, 100)
})

socket.on('score', (data) => {
	console.log('score', data)
	
	updateScore(data.name, parseFloat(data.score))
})


if(CONFIG.demoMode) {
	setInterval(() => {
		let id = (Math.random() * (29 - 0 + 1)) << 0
		let add = 1

		if(!scores[id]) { return }
		updateScore(scores.find(c => c.id == id).name, scores[id].score + add)
	}, 500)

	setInterval(() => {
		let id = (Math.random() * (6 - 0 + 1)) << 0
		let add = 1

		if(!scores[id]) { return }
		updateScore(scores.find(c => c.id == id).name, scores[id].score + add)
	}, 4000)

	let randomScore = () => {
		let id = (Math.random() * (29 - 0 + 1)) << 0
		let add = 1

		if(!scores[id]) { return }
		updateScore(scores.find(c => c.id == id).name, scores[id].score + add)
	}

	setTimeout(() => {
		for (let x=0;x<0;x++) {
			randomScore()
		}
	}, 500)
}