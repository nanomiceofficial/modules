import Plugin from './plugin'
import locale from '../utils/locale'
import { format } from '../utils/format'

const defaultOptions = {
    mapName: '',
    shamanName: '',
    admins: []
}

class UI extends Plugin {
    constructor(options) {
        super(options)

        this.name = 'ui'
        this.options = { ...options, ...defaultOptions }
    }

    onRegister() {
        this.options.mapName = `<span style="color: #AAAAAA; ">${locale.get('home')} ${this.home.owner}</span>`

        nm.room.getPlayers().forEach((player) => {
            this.onNewPlayer(player.name)
        })
    }

    onUnregister() {
        nm.ui.removeTextArea(0)
        nm.ui.removeTextArea(1)
        nm.ui.removeTextArea(2)
    }

    onNewPlayer(playerName) {
        // noinspection HtmlUnknownTarget
        nm.ui.addTextArea(0, `<a href='event:open_help'><b>?</b></a>`, playerName, 782, 29, 11, 17, 0x324650, 0x000000, 1, false)

        if (this.options.mapName !== '')
            nm.setUIMapName(this.options.mapName, playerName)
        if (this.options.shamanName !== '')
            nm.setUIShamanName(this.options.shamanName, playerName)
    }

    onNewGame() {
        if (this.options.mapName !== '')
            nm.setUIMapName(this.options.mapName)
        if (this.options.shamanName !== '')
            nm.setUIShamanName(this.options.shamanName)
    }

    onTextAreaCallback(id, playerName, callback) {
        switch (id) {
            case 0:
                switch (callback) {
                    case 'open_help':
                        nm.ui.addTextArea(1, this.getPanel(), playerName, 200, 40, 400, 300, 0x324650, 0x000000, 1, false)
                        nm.ui.addTextArea(2, `<a href=\'event:close_help\'><b>${locale.get('ui/close')}</b></a>`, playerName, 535, 355, 65, 20, 0x000000, 0x000000, 1, false)
                        break
                }
                break
            case 1:
                if (playerName !== this.home.owner && this.home.admins.indexOf(playerName) === -1) {
                    nm.chatMessage(locale.get('forbidden', locale.type.self), playerName)
                    return
                }

                const parts = callback.split('_')
                if (parts.length === 1)
                    return

                let force = (pluginName, force) => {
                    for (let plugin of this.home.options.plugins) {
                        if (plugin.name !== pluginName)
                            continue

                        if (plugin.enabled === force)
                            break

                        plugin.enabled = force
                        if (force) {
                            nm.chatMessage(format(locale.get('ui/pluginEnabled', locale.type.all), locale.get(`${plugin.name}/name`)))
                            if (plugin.eventRegister !== undefined)
                                plugin.eventRegister()
                        } else {
                            nm.chatMessage(format(locale.get('ui/pluginDisabled', locale.type.all), locale.get(`${plugin.name}/name`)))
                            if (plugin.eventUnregister !== undefined)
                                plugin.eventUnregister()
                        }
                        
                        nm.ui.updateTextArea(1, this.getPanel(), playerName)
                        break
                    }
                }

                switch (parts[0]) {
                    case 'enable':
                        force(parts[1], true)
                        break
                    case 'disable':
                        force(parts[1], false)
                        break
                    case 'addRights':
                        if (parts[1] === playerName)
                            break

                        if (this.home.admins.indexOf(parts[1]) !== -1)
                            break

                        this.home.admins.push(parts[1])
                        nm.chatMessage(format(locale.get('ui/addedAdmin', locale.type.all), parts[1]))
                        nm.ui.updateTextArea(1, this.getPanel(), playerName)
                        break
                    case 'removeRights':
                        if (parts[1] === playerName)
                            break

                        const index = this.home.admins.indexOf(parts[1])
                        if (index === -1)
                            break

                        this.home.admins.splice(index, 1)
                        nm.chatMessage(format(locale.get('ui/removedAdmin', locale.type.all), parts[1]))
                        nm.ui.updateTextArea(1, this.getPanel(), playerName)
                        break
                }
                break
            case 2:
                switch (callback) {
                    case 'close_help':
                        nm.ui.removeTextArea(1)
                        nm.ui.removeTextArea(2)
                        break
                }
                break
        }
    }

    getPanel() {
        let raw = `<J> (!) </j> <b>${locale.get('ui/players')}</b>\n\n`

        nm.room.getPlayers().sort((a, b) => {
            return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0)
        }).forEach((player) => {
            raw += `<V>${player.name}</V> `

            if (this.home.owner === player.name)
                raw += `<b>[${locale.get('ui/owner')}]</b> `
            else if (this.home.admins.indexOf(player.name) === -1)
                raw += `<a href='event:addRights_${player.name}'><BV>[${locale.get('ui/addRights')}]</BV></a> `
            else
                raw += `<a href='event:removeRights_${player.name}'><BV>[${locale.get('ui/removeRights')}]</BV></a> `
        })

        raw += `\n\n<J> (!) </j> <b>${locale.get('ui/plugins')}</b>\n`
        for (let plugin of this.home.options.plugins) {
            raw += `\n<b>${locale.get(`${plugin.name}/name`)}</b>: ${locale.get(`${plugin.name}/description`)} `
            if (plugin.name === 'ui')
                continue

            if (plugin.enabled)
                raw += `<a href='event:disable_${plugin.name}'><BV>[${locale.get('ui/disable')}]</BV></a>`
            else
                raw += `<a href='event:enable_${plugin.name}'><BV>[${locale.get('ui/enable')}]</BV></a>`
        }

        raw += `\n\n${locale.get('ui/disclaimer')}`

        return raw
    }
}

export default UI