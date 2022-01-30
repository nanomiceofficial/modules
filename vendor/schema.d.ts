declare interface INM {
    playEmote(playerName: string, emoteId: number): void
    bindKeyboard(playerName: string, keyCode: number, down: boolean, up: boolean): void
    addImage(imageName: string, target: string, posX: number, posY: number, playerName?: string): number
    addSprite(target: string, name: string, posX: number, posY: number, playerName?: string): void
    removeImage(imageId: number): void
    addConjuration(x: number, y: number): void

    addJoint(): void // TODO
    removeJoint(): void // TODO

    addShamanObject(itemID: number, posX, posY, rotation, velX, velY, ghost): number
    removeObject(objectID: number): void
    addPhysicObject(itemID: number, dynamic, t, posX, posY, width, height, unknown, foreground, friction,
                    restitution, angle, color, miceCollision, groundCollision, fixedRotation, mass,
                    linearDamping, angularDamping, image): void
    removePhysicObject(itemID: number): void
    chatMessage(message: string, playerName?: string): void
    newGame(m?: string): void
    giveCheese(playerName: string): void
    takeCheese(playerName: string): void
    playerVictory(playerName: string): void
    respawnPlayer(playerName: string): void
    setGameTime(seconds: number, init?: boolean): void
    setNameColor(playerName: string, color: number): void
    setPlayerScore(playerName: string, score: number): void
    setShaman(playerName: string): void
    setUIMapName(mapName: string, playerName?: string): void
    setUIShamanName(shamanName: string, playerName?: string): void
    setVampirePlayer(playerName: string): void
    snow(seconds: number, power: number): void
    disableStartTimer(value?: boolean): void
    disableRanked(value?: boolean): void
    disableAFKDeath(value?: boolean): void
    disableAllShamanSkills(value?: boolean): void
    disableAutoShaman(value?: boolean): void
    disableAutoTimeLeft(value?: boolean): void
    disableAutoNewGame(value?: boolean): void
    disableAutoScore(value?: boolean): void
    disableItems(value?: boolean): void
    disableCollideItems(value?: boolean): void
    displayParticle(particleID, posX, posY, velX, velY, accelX, accelY, playerName: string): void
    setGravity(seconds, gravity): void
    explosion(posX, posY, power, distance, collideMices: boolean, playerName: string): void
    giveMeep(playerName: string): void
    killPlayer(playerName: string): void
    moveObject(objectID, posX, posY, offset, velX, velY, velOffset, playerName: string): void
    movePlayer(playerName: string, posX, posY, offset, velX, velY, velOffset): void
    freezePlayer(playerName: string, is: boolean): void
    getInventory(playerName: string): IItem[]
    getInventoryItem(playerName: string, itemId): number
    addToInventory(playerName: string, itemId, amount): void
    takeFromInventory(playerName: string, itemId, amount): void
    hasShop(playerName: string, catId, itemId): void
    addToShop(playerName: string, catId, itemId): void
    hasTitle(playerName: string, titleId): boolean
    addTitle(playerName: string, titleId): void
    hasBadge(playerName: string, badgeId): void
    addBadge(playerName: string, badgeId): void
    spawnMonster(id: number, x: number, y: number, name: string): void
    setPlayerHealthIndicator(playerName: string, value: number): void
    killMonster(id: number): void
    setMonsterVelocity(id: number, xVel: number): void

    debug: INMDebug
    ui: INMUI
    system: INMSystem
    room: INMRoom
    storage: INMStorage
}

declare interface INMRoom {
    name: string
    communityName: string

    setUsername(from?: string, to?: string): void
    setLook(playerName?: string, look?: string): void
    getMap(): IMap
    getPlayer(playerName: string): IPlayer | undefined
    getPlayers(): IPlayer[]
    getUniquePlayers(): IPlayer[]
    getUniquePlayersCount(): number
    setSync(playerName: string): boolean
}

declare interface INMStorage {
    set(space: string, type: string, name: string, value: string): boolean
    remove(space: string, type: string, name: string): boolean
    has(space: string, type: string, name: string): boolean
    get(space: string, type: string, name: string): string
}

declare interface INMSystem {
    bindMouse(playerName: string, value?: boolean): void
    disableChatCommandDisplay(command: string, value?: boolean): void
}

declare interface INMUI {
    addPopup(id: number, type: number, text: string, posX: number, posY: number, width: number,
             fixedPos: boolean, playerName: string): void
    addTextArea(id: number, text: string, playerName: string, posX: number, posY: number, width: number, height: number,
                backgroundColor: number, borderColor: number, backgroundAlpha: number, fixedPos: boolean): void
    updateTextArea(id: number, text: string, playerName: string): void
    removeTextArea(id: number, playerName?: string): void
}

declare interface INMDebug {
    newPacket(c: number, cc: number): IPacket
    sendPacket(packet: IPacket): void
    sendPacketTo(packet: IPacket, playerName: string): void
}

declare interface IPacket {
    data: unknown

    writeByte(value: number): void
    writeUTF(value: string): void
    writeInt8(value: number): void
    writeUint8(value: number): void
    writeInt16(value: number): void
    writeUint16(value: number): void
    writeShort(value: number): void
    writeInt32(value: number): void
    writeUint32(value: number): void
    writeBool(value: boolean): void
    writeHex(value: string): void
}

interface IPlayer {
    code: number
    name: string
    privilege: number
    client: string
    titleId: number
    x: number
    y: number
    velX: number
    velY: number
    look: string
    isAfk: boolean
    isVampire: boolean
    isDead: boolean
    hasCheese: boolean
    isInHole: boolean
    isShaman: boolean
    shamanMode: number
    turn: number
}

interface IMap {
    id: number
    username: string
}

interface IItem {
    id: number
    amount: number
}

declare interface IModule {
    // Выполняется во время регистрации скрипта
    onRegister?(): void
    // Выполняется после выхода из скрипта
    onUnregister?(): void

    onChatCommand?(playerName: string, message): void
    onEmotePlayed?(playerName: string, emote): void
    onItemUsed?(playerName: string, itemId): void
    onKeyboardInput?(playerName: string, keyCode, down, posX, posY): void
    onMouseInput?(playerName: string, posX, posY): void
    onLoop?(time, remaining): void
    onNewGame?(): void
    onNewPlayer?(playerName: string): void
    onPlayerDied?(playerName: string): void
    onPlayerGetCheese?(playerName: string): void
    onPlayerLeft?(playerName: string): void
    onPlayerVampire?(playerName: string): void
    onPlayerWon?(playerName: string): void
    onPlayerRespawn?(playerName: string): void
    onPopupAnswer?(id: number, playerName: string, answer: string): void
    onSummoningStart?(playerName: string, objectType, posX, posY, angle): void
    onSummoningCancel?(playerName: string): void
    onTextAreaCallback?(id, playerName: string, callback): void
    onPlayerAttack?(playerName: string): void
    onPlayerReceivedDamage?(playerName: string): void
    onMonsterReceivedDamage?(playerName: string, monsterId: number, value: boolean): void
}

declare const nm: INM

declare function register(name: string, module: IModule, replace?: boolean) : void
declare function print(...values: any[]) : void
declare function getRegistered()  : string[]
declare function unregister(name: string) : void