# Making it work™: The Definitive Guide

Clone the repo from the `master` branch for the latest version.

## Server

Install node.js, any LTS version should be fine. Enter the server directory.
Node.js 12 for Debian/Ubuntu based distros:
```
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs
```

1) Run `npm install` to install dependenices.
2) Run `node index` to run the server.

The server also takes extra parameters, although you shouldn't need to change these:
```
Options:
  -V, --version        output the version number
  -s, --socket <port>  socket port (default: 12345)
  -w, --web <port>     web port (default: 80)
  -I, --no-interact    disable interactive mode
  -h, --help           output usage information
 ```
Ensure the server stays running for clients to remain connected.
You will see two segments, a log on the left and a list of countries on the right. If you can't see all the countries, expand your terminal.

The log will show countries connecting, and once connected their score as well.

The display can be accessed on port 80 (or the port set by the `w` flag) remotely, and is designed for a 1080p display only.

A logo will display on the display until you press F2 on the server to switch between the logo and scoreboard.

## Application

Ensure all PacketTracer installs are using the same version - this is important.
This version has been built for PacketTracer `7.2.0.0226`, if it differs - see troubleshooting section.

Build from source or download the latest binary from the [releases tab on GitHub](https://github.com/ConnorMcF/worldskills-scoreboard/releases).
All files from the build must be present, not just the EXE.

```
Options:
  -h, --host       Server hostname
  -p, --port       (Default: 12345) Server port
  -n, --name       Display name
  -P, --process    (Default: PacketTracer7) PT process name
  -O, --offsets    (Default: 0x03B609E8,0x2F0,0x280) PT offsets
  --help           Display this help screen.
  --version        Display version information.
```

If options are not provided, they will be prompted for interactively.

While it should be pretty good at recovering itself if the server goes down, I'd suggest creating a batch file just to stay on the safe side.
```batch
:loop
.\WorldSkillsScoreboard.exe --host 10.0.0.1 --name gb
goto loop
```

The name attribute should be any of the following, otherwise it won't show up:
| Code  | Country           |
|-------|-------------------|
| at  	| Austria        	|
| by  	| Belarus        	|
| br  	| Brazil         	|
| ca  	| Canada         	|
| cn  	| China          	|
| tpe 	| Chinese Taipei 	|
| co  	| Colombia       	|
| cr  	| Costa Rica     	|
| hr  	| Croatia        	|
| eg  	| Egypt          	|
| ee  	| Estonia        	|
| fr  	| France         	|
| de  	| Germany        	|
| hu  	| Hungary        	|
| id  	| Indonesia      	|
| ir  	| Iran           	|
| jp  	| Japan          	|
| kz  	| Kazakhstan     	|
| kr  	| Korea          	|
| li  	| Liechtenstein  	|
| mo  	| Macao, China   	|
| om  	| Oman           	|
| pt  	| Portugal       	|
| ru  	| Russia         	|
| sg  	| Singapore      	|
| za  	| South Africa   	|
| es  	| Spain          	|
| se  	| Sweden         	|
| ch  	| Switzerland    	|

If you wish to hide the window, you could either run it as a service somehow - or press `WIN+TAB` and create a new desktop, open it there and return.

# Troubleshooting

### [Application] Scores are being read incorrectly or not at all

You may be using a differing PacketTracer version, contact me or attempt to make sense of `application/WorldSkillsScoreboard/Program.cs#L245` (good luck).

For version `7.2.0.0226`, these are `0x03B609E8,0x2F0,0x280` and are set by default.

Once you have the updated memory offsets, use the `--offsets [base],[o1],[o2]` option to specify these without having to rebuild.

### It's on fire.

best of luck.