const defaultOptions = {
    plugins: []
}

export default class Home {
    constructor(options) {
        this.options = { ...defaultOptions, ...options }
        this.options.plugins.forEach((plugin) => {
            plugin.home = this
        })
    }

    onRegister() {
        this.owner = ''
        this.admins = []

        let parts = nm.room.name.split('#home0')
        if (parts.length === 2) {
            this.owner = parts[1]
            this.admins.push(parts[1])
        }
    }

    call(key, args) {
        if (this[key])
            this[key].apply(this, args)

        this.options.plugins.forEach((plugin) => {
            if (!plugin[key] || !plugin.enabled)
                return

            plugin[key].apply(plugin, args)
        })
    }

    getModule() {
        return {
            onRegister: () => this.call('onRegister', []),
            onUnregister: () => this.call('onUnregister', []),
            onChatCommand: (playerName, command) => this.call('onChatCommand', [playerName, command]),
            onEmotePlayed: (playerName, emoteId) => this.call('onEmotePlayed', [playerName, emoteId]),
            onItemUsed: (playerName, itemId) => this.call('onItemUsed', [playerName, itemId]),
            onKeyboardInput: (playerName, keyCode, down, posX, posY) => this.call('onKeyboardInput', [playerName, keyCode, down, posX, posY]),
            onMouseInput: (playerName, posX, posY) => this.call('onMouseInput', [playerName, posX, posY]),
            onLoop: (time, remaining) => this.call('onLoop', [time, remaining]),
            onNewGame: () => this.call('onNewGame', []),
            onNewPlayer: (playerName) => this.call('onNewPlayer', [playerName]),
            onPlayerDied: (playerName) => this.call('onPlayerDied', [playerName]),
            onPlayerGetCheese: (playerName) => this.call('onPlayerGetCheese', [playerName]),
            onPlayerLeft: (playerName) => this.call('onPlayerLeft', [playerName]),
            onPlayerVampire: (playerName) => this.call('onPlayerVampire', [playerName]),
            onPlayerWon: (playerName) => this.call('onPlayerWon', [playerName]),
            onPlayerRespawn: (playerName) => this.call('onPlayerRespawn', [playerName]),
            onPopupAnswer: (id, playerName, answer) => this.call('onPopupAnswer', [id, playerName, answer]),
            onSummoningStart: (playerName, objectType, posX, posY, angle) => this.call('onSummoningStart', [playerName, objectType, posX, posY, angle]),
            onSummoningCancel: (playerName) => this.call('onSummoningCancel', [playerName]),
            onTextAreaCallback: (id, playerName, callback) => this.call('onTextAreaCallback', [id, playerName, callback]),
            onPlayerAttack: (playerName) => this.call('onPlayerAttack', [playerName]),
            onPlayerReceivedDamage: (playerName) => this.call('onPlayerReceivedDamage', [playerName]),
            onMonsterReceivedDamage: (playerName, monsterId, value) => this.call('onMonsterReceivedDamage', [playerName, monsterId, value])
        }
    }
}