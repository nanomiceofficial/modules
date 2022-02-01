import { coloredText } from './utility/color'
import { unix } from './utility/time'
import { toModuleObject } from './utility/module'
import { moderators } from './data/moderators'

const colors = {
    global: '#B0B5B9',
    self: '#8FC0A0'
}

function formatCheckpoint(id, checkpoint, playerInfo) {
    // Первый чекпоинт стартовый, на нем не считаем время.
    if (parseInt(id) === 0)
        return `<b>${id}</b><a href="event:spawn_${id}"><img align='center' src='https://nanomice.eu/s/images/user/modules/parkour/np_p.png' alt='' hspace="0" vspace="5"/></a>`

    const playerScore = playerInfo.score[id] ? (playerInfo.score[id] / 1000).toFixed(2) : undefined
    const lastRecord = checkpoint.records ? checkpoint.records[checkpoint.records.length - 1] : undefined

    const timeContent = `${playerScore ? ' ' + playerScore : ''}${lastRecord ? ` ${(lastRecord.time / 1000).toFixed(2)} (${lastRecord.playerName})` : ''}`
    if (playerScore)
        return `<b>${id}</b>${timeContent}<a href="event:spawn_${id}"><img align='center' src='https://nanomice.eu/s/images/user/modules/parkour/np_p.png' alt='' hspace="0" vspace="5"/></a>`

    return `<b>${id}</b>${timeContent}<img align='center' src='https://nanomice.eu/s/images/user/modules/parkour/p_p.png' alt='' hspace="0" vspace="5"/>`
}

class Main {
    playerInfos = {}

    mapId = -1
    mapData = undefined
    started = false

    render(playerName, full = false) {
        if (!this.mapData)
            return

        const playerInfo = this.playerInfos[playerName]
        if (!playerInfo)
            return

        if (full) {
            for (const id of playerInfo.textAreas.checkpoints)
                nm.ui.removeTextArea(parseInt(id), playerName)
            playerInfo.textAreas.checkpoints = []
        }

        // Рисуем новые, если у карты есть чекпоинты и они загружены.
        if (this.mapData.checkpoints) {
            for (const [id, checkpoint] of Object.entries(this.mapData.checkpoints)) {
                if (playerInfo.textAreas.checkpoints.includes(id))
                    nm.ui.updateTextArea(parseInt(id), formatCheckpoint(id, checkpoint, playerInfo), playerName)
                else {
                    playerInfo.textAreas.checkpoints.push(id)

                    nm.ui.addTextArea(
                        parseInt(id),
                        formatCheckpoint(id, checkpoint, playerInfo),
                        playerName,
                        checkpoint.x - 33,
                        checkpoint.y - 75,
                        300,
                        150,
                        0.001,
                        0.001,
                        0.001,
                        true
                    )
                }
            }
        }
    }

    handleCheckpoints(playerName, posX, posY) {
        // Если нет чекпоинтов, то и нечего обрабатывать.
        if (!this.mapData.checkpoints)
            return

        const playerInfo = this.playerInfos[playerName]
        if (!playerInfo)
            return

        // Все чекпоинты взял, значит ничего уже не нужно.
        if (playerInfo.score.length >= this.mapData.checkpoints.length)
            return

        const id = playerInfo.score.length
        const checkpoint = this.mapData.checkpoints[id]
        if (Math.abs(checkpoint.x - posX) > 33 || Math.abs(checkpoint.y - posY) > 33)
            return

        const time = unix() - playerInfo.startAt

        playerInfo.score.push(time)
        playerInfo.startAt = unix()

        // Помечаем портал пройденным.
        nm.ui.updateTextArea(
            id,
            formatCheckpoint(id, checkpoint, playerInfo),
            playerName
        )
    }

    gotoLast(playerName) {
        const playerInfo = this.playerInfos[playerName]
        if (!playerInfo)
            return

        const player = nm.room.getPlayer(playerName)
        if (player.isDead || player.isInHole)
            nm.respawnPlayer(playerName)

        if (player.hasCheese)
            nm.takeCheese(playerName)

        if (this.mapData.checkpoints) {
            if (playerInfo.score.length > 0) {
                const checkpoint = this.mapData.checkpoints[playerInfo.score.length - 1]
                if (checkpoint)
                    nm.movePlayer(playerName, checkpoint.x, checkpoint.y, 0, 0, 0, 0)
            }
        }

        playerInfo.startAt = unix()
    }

    onRegister() {
        for (const command of ['next', 'save', 'wipe_checkpoints', 'wipe_records',
            'records', 'remove_record', 'checkpoints',
            'checkpoints_records', 'checkpoint_remove_record', 'checkpoint_remove', 'checkpoint_add',
            'checkpoint_update'])
            nm.system.disableChatCommandDisplay(command, true)

        nm.disableAutoNewGame()
        nm.disableAutoShaman()
        nm.disableAutoScore()
        nm.disableStartTimer()
        nm.disableItems()
        nm.disableAFKDeath()

        for (const player of nm.room.getPlayers())
            this.onNewPlayer(player.name, true)
    }

    onUnregister() {
        // Обновляем данные у игроков при respawn'е в начале игры.
        for (const [playerName, playerInfo] of Object.entries(this.playerInfos)) {
            nm.ui.removeTextArea(9998, playerName)
            for (const id of playerInfo.textAreas.checkpoints)
                nm.ui.removeTextArea(parseInt(id), playerName)
            playerInfo.textAreas = { checkpoints: [] }
        }
    }

    onNewGame() {
        if (!this.started)
            return

        // Обновляем данные у игроков при respawn'е в начале игры.
        for (const [playerName, playerInfo] of Object.entries(this.playerInfos)) {
            playerInfo.startAt = unix()
            playerInfo.score = [0]
            // Убираем старые чекпоинты.
            for (const id of playerInfo.textAreas.checkpoints)
                nm.ui.removeTextArea(parseInt(id), playerName)
            playerInfo.textAreas = { checkpoints: [] }
        }

        // Если предыдущая карта была обработана нами.
        if (this.mapId !== 0) {
            // Обновляем информацию о предыдущей карте.
            nm.storage.set('parkour', 'map_data', this.mapId.toString(), JSON.stringify(this.mapData))

            this.mapId = -1
            this.mapData = undefined
        }

        // Получаем информацию о новой карте.
        const map = nm.room.getMap()
        if (map.username !== '') {
            this.mapId = map.id
            if (nm.storage.has('parkour', 'map_data', map.id.toString()))
                this.mapData = JSON.parse(nm.storage.get('parkour', 'map_data', map.id.toString()))
            else {
                nm.chatMessage(coloredText(colors.global, `〢 Информация о карте @${map.id} не найдена.`))

                this.mapData = {
                    checkpoints: [],
                    records: []
                }
            }
        }

        nm.setUIMapName(coloredText(colors.global, 'Parkour - season 1'))
        nm.setGameTime(300)

        if (this.mapData.records && this.mapData.records.length > 0) {
            const lastRecord = this.mapData.records[this.mapData.records.length - 1]

            const date = new Date(lastRecord.createdAt)
            const dateContent = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`

            nm.chatMessage(coloredText(
                colors.global,
                `〢 Рекорд прохождения карты (<font color='#C4A7C6'>${(lastRecord.time / 1000).toFixed(2)}</font> сек) установлен игроком <BL>${lastRecord.playerName}</BL> ${dateContent}. Попробуйте пройти быстрее!`
            ))
        }

        // Обновляем картинку у всех.
        for (const playerName of Object.keys(this.playerInfos))
            this.render(playerName, true)

        // Возрождаем всех!
        for (const player of nm.room.getPlayers())
            this.gotoLast(player.name)
    }

    onNewPlayer(playerName, init) {
        nm.setUIMapName(coloredText(colors.global, 'Parkour - season 1'), playerName)
        nm.ui.addTextArea(
            9998,
            '<a href="event:restart">Начать сначала</a>',
            playerName,
            695, 372, 100, 18, 0, 0, 0.5, false
        )

        // Раздеваем мышку. (как в bootcamp)
        nm.room.setLook(playerName, '1;0,0,0,0')

        this.playerInfos[playerName] = {
            startAt: unix(),
            score: [0],
            textAreas: { checkpoints: [] }
        }

        for (const keyCode of [71, 65, 68, 83, 87, 37, 38, 39, 40])
            nm.bindKeyboard(playerName, keyCode, true, true)

        // Обновляем картинку.
        this.render(playerName, true)

        if (!init) {
            nm.chatMessage(coloredText(
                    colors.self,
                    `〢 <BL>${playerName}</BL>, добро пожаловать в #parkour!`
                ),
                playerName
            )

            nm.chatMessage(coloredText(
                    colors.self,
                    `〢 <BL>${playerName}</BL>, пройденные чекпоинты активируются автоматически, но если вам важно время, вы можете нажать любую из клавиш движения около него для мгновенной активации (WASD, стрелочки). Используйте клавишу G для возрождения на последний пройденный чекпоинт, либо кликните мышью на любой, пройденный ранее (но ваш прогресс будет утерян!)`
                ),
                playerName
            )

            this.gotoLast(playerName)
        }
    }

    onPlayerDied(playerName) {
        this.gotoLast(playerName)
    }

    onPlayerWon(playerName) {
        const playerInfo = this.playerInfos[playerName]
        if (!playerInfo)
            return

        // Если нет чекпоинтов, то и рекордов, значит ниже не идем.
        if (!this.mapData.checkpoints) {
            this.gotoLast(playerName)
            return
        }

        if (playerInfo.score.length !== this.mapData.checkpoints.length) {
            nm.chatMessage(coloredText(
                    colors.self,
                    `〢 <BL>${playerName}</BL>, вы упустили один из чекпоинтов, поэтому ваша статистика не будет учтена.`
                ),
                playerName
            )
            this.gotoLast(playerName)
            return
        }

        let renderRequired = false
        let totalTime = unix() - playerInfo.startAt
        for (const [id, time] of Object.entries(playerInfo.score)) {
            totalTime += time

            const checkpoint = this.mapData.checkpoints[id]
            if (checkpoint.records && checkpoint.records.length > 0) {
                const lastRecord = checkpoint.records[checkpoint.records.length - 1]
                if (time < lastRecord.time) {
                    checkpoint.records.push({
                        playerName,
                        time,
                        createdAt: unix()
                    })
                    renderRequired = true
                }
            } else {
                checkpoint.records = [{ playerName, time, createdAt: unix() }]
                renderRequired = true
            }
        }

        nm.chatMessage(coloredText(
                colors.self,
                `〢 <BL>${playerName}</BL>, вы прошли карту за <font color='#C4A7C6'>${(totalTime / 1000).toFixed(2)}</font> сек.`
            ),
            playerName
        )

        const announceNewRecord = () => {
            nm.chatMessage(coloredText(
                colors.global,
                `〢 <BL>${playerName}</BL> установил новый рекорд прохождения карты: <font color='#C4A7C6'>${(totalTime / 1000).toFixed(2)}</font> сек.`
            ))
        }

        if (this.mapData.records && this.mapData.records.length > 0) {
            const lastRecord = this.mapData.records[this.mapData.records.length - 1]
            if (totalTime < lastRecord.time) {
                this.mapData.records.push({
                    playerName,
                    time: totalTime,
                    createdAt: unix()
                })

                announceNewRecord()
            }
        } else {
            this.mapData.records = [{
                playerName,
                time: totalTime,
                createdAt: unix()
            }]

            announceNewRecord()
        }

        this.gotoLast(playerName)

        // Обновляем отображение рекордов у всех!
        if (renderRequired)
            for (const otherPlayerName of Object.keys(this.playerInfos))
                this.render(otherPlayerName)
    }

    onKeyboardInput(playerName, keyCode, down, posX, posY) {
        switch (keyCode) {
            case 71: // G
                this.gotoLast(playerName)
                break
            case 65: // A
            case 68: // D
            case 83: // S
            case 87: // W
            case 37: // Left
            case 38: // Up
            case 39: // Right
            case 40: // Down
                this.handleCheckpoints(playerName, posX, posY)
                break
        }
    }

    onPlayerLeft(playerName) {
        nm.room.setLook(playerName)
    }

    onTextAreaCallback(id, playerName, callback) {
        if (callback === '')
            return

        const playerInfo = this.playerInfos[playerName]
        if (!playerInfo)
            return

        const args = callback.split('_')

        switch (args[0]) {
            case 'restart':
                playerInfo.score = [0]
                this.render(playerName)
                this.gotoLast(playerName)
                break
            case 'spawn':
                if (args.length !== 2)
                    break

                const id = parseInt(args[1])
                if (playerInfo.score.length < id)
                    break

                // Игрок теряет прохождение, если спавнится на более раннем чекпоинте.
                if (id + 1 < playerInfo.score.length) {
                    playerInfo.score.length = id + 1
                    this.render(playerName)
                }

                this.gotoLast(playerName)
                break
        }
    }

    onLoop(time, remaining) {
        if (!this.started) {
            nm.newGame('#78')
            this.started = true
            return
        }

        // Unsigned int.
        if (remaining >= 100000000)
            nm.newGame('#78')

        for (const player of nm.room.getPlayers())
            this.handleCheckpoints(player.name, player.x, player.y)
    }

    onChatCommand(playerName, command) {
        const args = command.split(' ')

        // Команды только для модераторов ниже.
        if (!moderators.includes(playerName))
            return

        // region Команды
        switch (args[0]) {
            case 'next':
                // Если предыдущая карта была обработана нами.
                if (this.mapId !== 0) {
                    // Обновляем информацию о предыдущей карте.
                    nm.storage.set('parkour', 'map_data', this.mapId.toString(), JSON.stringify(this.mapData))
                }

                nm.newGame('#78')
                break
            case 'save':
                // Если предыдущая карта была обработана нами.
                if (this.mapId !== 0) {
                    // Обновляем информацию о предыдущей карте.
                    nm.storage.set('parkour', 'map_data', this.mapId.toString(), JSON.stringify(this.mapData))
                    nm.chatMessage(`Карта сохранена.`, playerName)
                }
                break
            case 'wipe_checkpoints':
                delete this.mapData['checkpoints']

                // Обновляем картинку у всех.
                for (const otherPlayerName of Object.keys(this.playerInfos))
                    this.render(otherPlayerName, true)
                break
            case 'wipe_records':
                delete this.mapData['records']
                for (const checkpoint of this.mapData.checkpoints)
                    delete checkpoint['records']

                // Обновляем картинку у всех.
                for (const otherPlayerName of Object.keys(this.playerInfos))
                    this.render(otherPlayerName)
                break
            case 'records':
                if (this.mapData) {
                    if (this.mapData.records) {
                        let data = ''
                        for (const [id, record] of Object.entries(this.mapData.records))
                            data += `№${id} - time: ${record.time}, by: ${record.playerName}, createdAt: ${new Date(record.createdAt)}\n`

                        nm.chatMessage(coloredText(
                                colors.self,
                                `〢 Рекорды карты: \n${data}`),
                            playerName
                        )
                    }
                }
                break
            case 'remove_record': {
                if (args.length !== 2)
                    return

                const id = parseInt(args[1])
                if (this.mapData && this.mapData.records && this.mapData.records[id]) {
                    this.mapData.records.splice(id, 1)

                    // Обновляем картинку у всех.
                    for (const otherPlayerName of Object.keys(this.playerInfos))
                        this.render(otherPlayerName)
                }
                break
            }
            case 'checkpoints':
                if (this.mapData && this.mapData.checkpoints) {
                    let data = ''
                    for (const [id, checkpoint] of Object.entries(this.mapData.checkpoints))
                        data += `№${id} - x: ${checkpoint.x}, y: ${checkpoint.y}\n`

                    nm.chatMessage(coloredText(
                            colors.self,
                            `〢 Чекпоинты карты: \n${data}`),
                        playerName
                    )
                }
                break
            case 'checkpoint_records': {
                if (args.length !== 2)
                    return

                const checkpointID = parseInt(args[1])

                if (this.mapData.checkpoints && this.mapData.checkpoints[checkpointID]) {
                    const checkpoint = this.mapData.checkpoints[checkpointID]

                    let data = ''
                    if (!checkpoint.records || checkpoint.records.length === 0)
                        break

                    for (const [rId, record] of Object.entries(checkpoint.records))
                        data += `- №${rId} - time: ${record.time}, by: ${record.playerName}, createdAt: ${new Date(record.createdAt)}\n`

                    nm.chatMessage(coloredText(
                            colors.self,
                            `〢 Рекорды чекпоинта №${checkpointID}: \n${data}`),
                        playerName
                    )
                }
                break
            }
            case 'checkpoint_remove_record':
                if (args.length !== 3)
                    return

                const checkpointID = parseInt(args[1])
                const recordID = parseInt(args[2])

                if (this.mapData.checkpoints) {
                    const checkpoint = this.mapData.checkpoints[checkpointID]
                    if (!checkpoint)
                        break

                    if (checkpoint.records && checkpoint.records[recordID]) {
                        checkpoint.records.splice(recordID, 1)

                        // Обновляем картинку у всех.
                        for (const otherPlayerName of Object.keys(this.playerInfos))
                            this.render(otherPlayerName)
                        break
                    }
                }
                break
            case 'checkpoint_remove':
                if (args.length !== 2)
                    return

                const id = parseInt(args[1])
                if (this.mapData.checkpoints)
                    if (this.mapData.checkpoints.length > id) {
                        this.mapData.checkpoints.splice(id, 1)

                        nm.chatMessage(`Чекпоинт №${id} удален.
                            `, playerName)
                    }

                // Обновляем картинку у всех при удалении.
                for (const otherPlayerName of Object.keys(this.playerInfos))
                    this.render(otherPlayerName, true)

                break
            case 'checkpoint_add':
                let x, y
                if (args.length >= 3) {
                    x = parseInt(args[1])
                    y = parseInt(args[2])
                } else {
                    const player = nm.room.getPlayer(playerName)
                    x = player.x
                    y = player.y
                }

                let order = -1
                if (args.length >= 4)
                    order = parseInt(args[3])

                let index = -1
                if (this.mapData.checkpoints) {
                    if (order !== -1) {
                        index = order

                        // Если нужно поставить в определенную позицию.
                        if (this.mapData.checkpoints.length > order)
                            this.mapData.checkpoints.splice(order, 0, { x, y })
                        else
                            this.mapData.checkpoints.push({ x, y })
                    } else
                        index = this.mapData.checkpoints.push({ x, y })
                } else {
                    index = 0
                    this.mapData.checkpoints = [{ x, y }]
                }

                if (index !== -1)
                    nm.chatMessage(`Чекпоинт №${index + 1} добавлен.`, playerName)

                // Обновляем картинку у всех.
                for (const otherPlayerName of Object.keys(this.playerInfos))
                    this.render(otherPlayerName, true)

                break
            case 'checkpoint_update': {
                if (args.length < 2)
                    return

                const id = parseInt(args[1])

                let x, y
                if (args.length >= 4) {
                    x = parseInt(args[1])
                    y = parseInt(args[2])
                } else {
                    const player = nm.room.getPlayer(playerName)
                    x = player.x
                    y = player.y
                }

                const checkpoint = this.mapData.checkpoints[id]
                checkpoint.x = x
                checkpoint.y = y

                // Обновляем картинку у всех.
                for (const otherPlayerName of Object.keys(this.playerInfos))
                    this.render(otherPlayerName, true)
                break
            }
        }
        // endregion
    }
}

const main = new Main()

register(
    'parkour',
    toModuleObject(main),
    true
)

