import Plugin from './plugin'
import locale from '../utils/locale'
import { format } from '../utils/format'

const defaultOptions = {}

export default class Commandor extends Plugin {
    constructor(options) {
        super(options)

        this.name = 'commandor'
        this.options = { ...options, ...defaultOptions }
    }

    onRegister() {
        this.commands = ['message']
        this.autorespawn = false
        this.disableautonewgame = false
        this.disableautoshaman = false
        this.lastRespawnAt = 0

        for (let command of this.commands)
            nm.system.disableChatCommandDisplay(command, true)
    }

    onUnregister() {
        for (let command of this.commands)
            nm.system.disableChatCommandDisplay(command, false)

        nm.disableAutoNewGame(false)
        nm.disableAutoShaman(false)
    }

    onNewGame() {
        if (this.disableautonewgame)
            nm.setGameTime(5)
    }

    onChatCommand(playerName, command) {
        if (this.home.owner !== playerName && this.home.admins.indexOf(playerName) === -1)
            return

        let args = command.split(' ')
        switch (args[0]) {
            case 'message':
                if (args.length < 2)
                    break

                nm.chatMessage(`<span style="color: #AAAAAA; ">Ξ [${locale.get('home')}] ${[...args].splice(1, args.length).join(' ')}</span>`)
                break
            case 'new':
                if (args.length !== 2)
                    break

                let type
                switch (args[1]) {
                    case 'bootcamp':
                        type = '#3'
                        break
                    case 'vanilla':
                        type = '#' + (49 + Math.round(Math.random())).toString()
                        break
                    case 'racing':
                        type = '#7'
                        break
                    case 'defilante':
                        type = '#18'
                        break
                    case 'tribe':
                        type = '#22'
                        break
                    case 'survivor':
                        type = '#10'
                        break
                    case 'village':
                        type = '@801'
                        break
                }

                if (type !== undefined)
                    nm.newGame(type)
                
                break
            case 'cheese':
                if (args.length !== 2)
                    break
                    
                nm.giveCheese(args[1])
                break
            case 'takecheese':
                if (args.length !== 2)
                    break
                
                nm.takeCheese(args[1])
                break
            case 'win':
                if (args.length !== 2)
                    break
                    
                nm.playerVictory(args[1])
                break
            case 'autorespawn':
                this.autorespawn = !this.autorespawn
                nm.chatMessage(format(locale.get('commandor/autorespawn', locale.type.self), this.autorespawn ? `✅` : `❎`), playerName)
                break
            case 'time':
                if (args.length !== 2)
                    break

                nm.setGameTime(Number(args[1]), false)
                break
            case 'notime':
                this.disableautonewgame = !this.disableautonewgame
                nm.disableAutoNewGame(this.disableautonewgame)
                nm.setGameTime(5)
                break
            case 'sha':
                if (args.length !== 2)
                    break

                nm.setShaman(args[1])
                break
            case 'nosha':
                this.disableAutoShaman = !this.disableAutoShaman
                nm.disableAutoShaman(this.disableAutoShaman)
                break
            case 'snow':
                if (args.length !== 2)
                    break

                nm.snow(Number(args[1]), 10)
                break
            case 'gravity':
                if (args.length !== 3)
                    break

                nm.setGravity(Number(args[1]), Number(args[2]))
                break
            case 'meep':
                if (args.length !== 2)
                    break

                nm.giveMeep(args[1])
                break
            case 'kill':
                if (args.length !== 2)
                    break

                nm.killPlayer(args[1])
                break

        }
    }

    onLoop(_time, _remaining) {
        if (!this.autorespawn || ((Date.now() - this.lastRespawnAt) < 2000)) {
            return
        }

        nm.room.getPlayers().forEach((player) => {
            if (!player.isInHole && !player.isDead)
                return

            nm.respawnPlayer(player.name)
        })

        this.lastRespawnAt = Date.now()
    }
}