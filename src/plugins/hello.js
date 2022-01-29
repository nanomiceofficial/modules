import Plugin from './plugin'
import locale from '../utils/locale'

const defaultOptions = {}

class Hello extends Plugin {
    constructor(options) {
        super(options)

        this.name = 'hello'
        this.options = { ...options, ...defaultOptions }
    }

    onNewPlayer(playerName) {
        nm.chatMessage(locale.format('hello/joinedRoom', locale.type.all, playerName))
    }

    onPlayerLeft(playerName) {
        nm.chatMessage(locale.format('hello/leftRoom', locale.type.all, playerName))
    }
}

export default Hello