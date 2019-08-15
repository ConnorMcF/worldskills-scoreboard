let COUNTRIES = {"at":"Austria","by":"Belarus","br":"Brazil","ca":"Canada","cn":"China","tpe":"Chinese Taipei","co":"Colombia","cr":"Costa Rica","hr":"Croatia","eg":"Egypt","ee":"Estonia","fr":"France","de":"Germany","hu":"Hungary","id":"Indonesia","ir":"Iran","jp":"Japan","kz":"Kazakhstan","kr":"Korea","li":"Liechtenstein","mo":"Macao, China","om":"Oman","pt":"Portugal","ru":"Russia","sg":"Singapore","za":"South Africa","es":"Spain","se":"Sweden"/*,"ch":"Switzerland"*/}

Object.keys(COUNTRIES).forEach((c) => {
	let name = COUNTRIES[c]

	Scoreboard.scores[c] = {
		name: c,
		score: -1
	}

	//Scoreboard.shell.log(JSON.stringify(Scoreboard.scores, null, 2))
})

module.exports = {
	COUNTRIES
}