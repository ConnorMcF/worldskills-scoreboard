const blessed = require('blessed')
const contrib = require('blessed-contrib')

process.env.TERM = 'windows-ansi'

const LOGO = [
	`                  __   __    __    _ ____  `,
	` _    _____  ____/ /__/ /__ / /__ (_) / /__`,
	`| |/|/ / _ \\/ __/ / _  (_-</  '_// / / (_-<`,
	`|__,__/\\___/_/ /_/\\_,_/___/_/\\_\\/_/_/_/___/`,
	`                                           `,
	`           REAL-TIME  SCOREBOARD           `,
	`                                           `,
]

const screen = blessed.screen({
    smartCSR: true,
    autoPadding: true
})

let grid = new contrib.grid({ rows: 14, cols: 14, screen })

let ui = {
    log: grid.set(0, 0, 14, 10, blessed.log, {
        label: 'Log',
        tags: true
    }),
    competitors: grid.set(0, 10, 14, 4, blessed.box, {
        label: 'Competitors (0/' + Object.keys(Scoreboard.consts.COUNTRIES).length + ')',
        content: '{red-fg}NO DATA{/red-fg}',
        tags: true
    }),
    controls: grid.set(13, 0, 2, 14, blessed.box, {
        label: null,
        content: `F1       F2       F3       F4       F5       F6       F7       F8       F9       F10      F11      F12    \n` +
                 `Help     Display  ?        ?        ?        ?        ?        ?        ?        ?        ?        ?      `,
        tags: true
    })
}
screen.append(ui.log)
screen.append(ui.competitors)
screen.append(ui.controls)


let updateComp = function() {
	let countries = Object.keys(Scoreboard.consts.COUNTRIES)

	countries.sort(function(a, b) { return Scoreboard.scores[b].score - Scoreboard.scores[a].score })

	let data = countries.map((s) => {
		let name = Scoreboard.consts.COUNTRIES[s]
		return name.padStart(14, ' ') + ' ' + (Scoreboard.scores[s].score == -1 ? '{red-fg}Disconnected{/red-fg}' : Scoreboard.scores[s].score.toFixed(2) + '%')
	}).join('\n')

	let connected = Object.keys(Scoreboard.scores).filter(s => Scoreboard.scores[s].score != -1).length

	ui.competitors.setLabel({ text: 'Competitors (' + connected + '/' + Object.keys(Scoreboard.consts.COUNTRIES).length +')' })
	ui.competitors.content = data
}

let log = function(msg) {
    let date = new Date().toTimeString().split(' ')[0]
    ui.log.log('{bold}' + date + '{/bold} ' + msg)
    screen.render()
}

LOGO.forEach((ln) => {
	log(ln)
})

updateComp()

let nextChange = 0

let keys = {
    'C-c': () => {
        process.exit(0)
    },

    'f1': () => {
    	log('rtfm')
    },
    'f2': () => {
    	if(Date.now() < nextChange) { return }
		nextChange = Date.now() + 1500

    	let disp = Scoreboard.socket.switchDisplay()
    	log('Display changed to ' + disp)
    }
}

const stdin = process.openStdin()
stdin.setRawMode(true)

stdin.on('keypress', function (chunk, key) {
    if(!key.full) { return }
    if(!keys[key.full]) { return }
    keys[key.full]()
})

module.exports = {
	log,
	updateComp
}