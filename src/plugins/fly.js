import Plugin from './plugin'

const defaultOptions = {}

export default class Fly extends Plugin {
    constructor(options) {
        super(options)

        this.name = 'fly'
        this.options = { ...options, ...defaultOptions }
    }

    onRegister() {
        nm.room.getPlayers().forEach(player => {
            this.onNewPlayer(player.name)
        })
    }

    onNewPlayer(playerName) {
        nm.bindKeyboard(playerName, 0x20, true, true)
    }

    onKeyboardInput(playerName, keyCode, _down, _posX, _posY) {
        if (keyCode === 0x20)
            nm.movePlayer(playerName, 0, 0, true, 0, -50, false)
    }
}