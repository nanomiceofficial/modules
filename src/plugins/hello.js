import Plugin from './plugin'
import locale from '../utils/locale'
import { format } from '../utils/format'

const defaultOptions = {}

export default class Hello extends Plugin {
    constructor(options) {
        super(options)

        this.name = 'hello'
        this.options = { ...options, ...defaultOptions }
    }

    onNewPlayer(playerName) {
        nm.chatMessage(format(locale.get('hello/joinedRoom', locale.type.all), playerName))
    }

    onPlayerLeft(playerName) {
        nm.chatMessage(format(locale.get('hello/leftRoom', locale.type.all), playerName))
    }
}