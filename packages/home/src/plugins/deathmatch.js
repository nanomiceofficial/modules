import Plugin from './plugin'
import locale from '../utils/locale'
import { getAlivePlayers } from '../utils/extensions'
import { format } from '../utils/format'

const defaultOptions = {}

class Deathmatch extends Plugin {
    constructor(options) {
        super(options)

        this.name = 'deathmatch'
        this.options = { ...options, ...defaultOptions }
    }

    onRegister() {
        this.init = false
        this.started = false
        this.players = {}
        this.keys = [0x28, 0x53, 0x20]
        this.maps = ['@4075355', '@4074458', '@4074459', '@4074460', '@4074461', '@4074464', '@4074438', '@4074439', '@4074483', '@4074496', '@4074494',
            '@4074493', '@4076664,4076668', '@4076666', '@4076781', '@4076772', '@4076764', '@4076748', '@4074583', '@4074586', '@4074587', '@4076836',
            '@4076839', '@4076840', '@4076850', '@4076951', '@4077869', '@4077505', '@4078343', '@4078349', '@4077872', '@4077953', '@4077521', '@4076872',
            '@4076962', '@4077854', '@4077468', '@4077503', '@4077970', '@4077049', '@4078272', '@4077962', '@4077518', '@4076852', '@4077876', '@4077500',
            '@4077967', '@4078347', '@4077875', '@4077861', '@4078273', '@4076855', '@4077974', '@4077883', '@4076853', '@5000723', '@5000540', '@5000524',
            '@5000527', '@5000530', '@4077881', '@4078344', '@4077648', '@5001225', '@5000761', '@5000756', '@5000757', '@5003258', '@5002857', '@5001668',
            '@5001664', '@5001717', '@5001661', '@5001408', '@5001401']

        nm.disableAutoShaman()
        nm.disableAutoNewGame()
        nm.disableAutoTimeLeft()

        nm.room.getPlayers().forEach(player => {
            this.onNewPlayer(player.name)
        })

        nm.newGame(this.maps[Math.floor(Math.random() * this.maps.length)])
    }

    onUnregister() {
        nm.disableAutoShaman(false)
        nm.disableAutoNewGame(false)
        nm.disableAutoTimeLeft(false)
    }

    onNewGame() {
        this.started = false

        for (let player of this.players) {
            player.cannonID = 0
            player.shootAt = Date.now()
        }

        nm.setUIShamanName('<N>Deathmatch')
    }

    onNewPlayer(playerName) {
        this.players[playerName] = {
            offset: {
                x: 2,
                y: 10,
            },
            cannonType: 0,
            cannonID: 0,
            shootAt: Date.now(),
        }

        for (const key of this.keys) {
            nm.bindKeyboard(playerName, key, true, true)
        }

        nm.setUIShamanName('<N>Deathmatch', playerName)
    }

    onPlayerDied(playerName) {
        if (this.players[playerName] === undefined)
            return

        const alivePlayers = getAlivePlayers()
        nm.setUIShamanName('<N>Deathmatch: <V>' + alivePlayers.length.toString() + '</V> в живых')
    }

    onPlayerLeft(playerName) {
        delete this.players[playerName]
    }

    onKeyboardInput(playerName, keyCode, down, posX, posY) {
        if (!this.started || this.players[playerName] === undefined)
            return

        let player = this.players[playerName]
        let roomPlayer = nm.room.getPlayer(playerName)
        if (roomPlayer.isDead)
            return

        if (keyCode === 0x28 || keyCode === 0x53 || keyCode === 0x20) {
            if (player.shootAt < (Date.now() - 800)) {
                player.shootAt = Date.now()

                if (player.cannonID !== 0)
                    nm.removeObject(player.cannonID)

                const x = roomPlayer.turn === 0 ? (posX - player.offset.x) : (posX + player.offset.x)
                const y = posY + player.offset.y
                const angle = roomPlayer.turn === 0 ? 270 : 90

                if (player.cannonType === 0)
                    player.cannonID = nm.addShamanObject(17, x, y, angle, 0, 0, false)
                else
                    player.cannonID = nm.addShamanObject(1700 + player.cannonType, x, y, angle, 0, 0, false)
            }
        }
    }

    onChatCommand(playerName, command) {
        if (this.players[playerName] === undefined)
            return

        const player = this.players[playerName]
        const args = command.split(' ')
        switch (args[0]) {
            case 'offset':
            case 'off':
                if (args.length === 0) {
                    nm.chatMessage(format(locale.get('deathmatch/offset', locale.type.self), player.offset.x, player.offset.y), playerName)
                    break
                }
                
                if (args.length !== 3) {
                    nm.chatMessage(format(locale.get('deathmatch/use', locale.type.self), '!off x(-100-100) y(-100-100)'), playerName)
                    break
                }

                let x = Number(args[1])
                if (Math.abs(x) >= 1 && Math.abs(x) <= 100)
                    player.offset.x = x

                let y = Number(args[2])
                if (Math.abs(y) >= 1 && Math.abs(y) <= 100)
                    player.offset.y = y

                nm.chatMessage(format(locale.get('deathmatch/offset', locale.type.self), player.offset.x, player.offset.y), playerName)
                break
            case 'ct':
                if (args.length !== 2) {
                    nm.chatMessage(format(locale.get('deathmatch/use', locale.type.self), '!ct id(1-12)'), playerName)
                    break
                }

                let id = Number(args[1])
                if (id >= 0 && id <= 12) {
                    player.cannonType = id
                }

                break
            case 'help':
                nm.chatMessage(format(locale.get('deathmatch/use', locale.type.self), '!off x(-100-100) y(-100-100)'), playerName)
                nm.chatMessage(format(locale.get('deathmatch/use', locale.type.self), '!ct id(1-12)'), playerName)
                break
        }
    }

    onLoop(time, remaining) {
        if (time >= 3000 && !this.started) {
            this.started = true
        }

        if (remaining >= 500000 || remaining <= 0) {
            nm.newGame(this.maps[Math.floor(Math.random() * this.maps.length - 1)])
            return
        }

        if (remaining > 10000 && getAlivePlayers().length <= 1)
            nm.setGameTime(10)
    }
}

export default Deathmatch