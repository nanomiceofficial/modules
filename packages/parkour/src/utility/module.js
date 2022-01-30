// toModuleObject используется для преобразования классов в объект, требуемый для регистрации модуля в игре.
export function toModuleObject(value) {
    return {
        onRegister: () => value['onRegister']?.apply(value),
        onUnregister: () => value['onUnregister']?.apply(value),
        onChatCommand: (playerName, command) => value['onChatCommand']?.apply(value, [playerName, command]),
        onEmotePlayed: (playerName, emoteId) => value['onEmotePlayed']?.apply(value, [playerName, emoteId]),
        onItemUsed: (playerName, itemId) => value['onItemUsed']?.apply(value, [playerName, itemId]),
        onKeyboardInput: (playerName, keyCode, down, posX, posY) =>
            value['onKeyboardInput']?.apply(value, [playerName, keyCode, down, posX, posY]),
        onMouseInput: (playerName, posX, posY) => value['onMouseInput']?.apply(value, [playerName, posX, posY]),
        onLoop: (time, remaining) => value['onLoop']?.apply(value, [time, remaining]),
        onNewGame: (playerName) => value['onNewGame']?.apply(value, [playerName]),
        onNewPlayer: (playerName) => value['onNewPlayer']?.apply(value, [playerName]),
        onPlayerDied: (playerName) => value['onPlayerDied']?.apply(value, [playerName]),
        onPlayerGetCheese: (playerName) => value['onPlayerGetCheese']?.apply(value, [playerName]),
        onPlayerLeft: (playerName) => value['onPlayerLeft']?.apply(value, [playerName]),
        onPlayerVampire: (playerName) => value['onPlayerVampire']?.apply(value, [playerName]),
        onPlayerWon: (playerName) => value['onPlayerWon']?.apply(value, [playerName]),
        onPlayerRespawn: (playerName) => value['onPlayerRespawn']?.apply(value, [playerName]),
        onPopupAnswer: (id, playerName, answer) => value['onPopupAnswer']?.apply(value, [id, playerName, answer]),
        onSummoningStart: (playerName, objectType, posX, posY, angle) =>
            value['onSummoningStart']?.apply(value, [playerName, objectType, posX, posY, angle]),
        onSummoningCancel: (playerName) => value['onSummoningCancel']?.apply(value, [playerName]),
        onTextAreaCallback: (id, playerName, callback) =>
            value['onTextAreaCallback']?.apply(value, [id, playerName, callback]),
        onPlayerAttack: (playerName) => value['onPlayerAttack']?.apply(value, [playerName]),
        onPlayerReceivedDamage: (playerName) => value['onPlayerReceivedDamage']?.apply(value, [playerName]),
        onMonsterReceivedDamage: (playerName, monsterId, value) =>
            value['onMonsterReceivedDamage']?.apply(value, [playerName, monsterId, value]),
    }
}