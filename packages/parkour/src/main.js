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

    render(playerName) {
        if (!this.mapData)
            return

        const playerInfo = this.playerInfos[playerName]
        if (!playerInfo)
            return

        // Удаляем старые чекпоинты.
        for (const id of playerInfo.textAreas.checkpoints)
            nm.ui.removeTextArea(parseInt(id), playerName)
        playerInfo.textAreas.checkpoints = []

        // Рисуем новые, если у карты есть чекпоинты и они загружены.
        if (this.mapData.checkpoints) {
            for (const [id, checkpoint] of Object.entries(this.mapData.checkpoints)) {
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

    onRegister() {
        for (const command of ['next', 'save', 'records', 'remove_record', 'checkpoints', 'checkpoints_records', 'checkpoint_remove_record', 'checkpoint_remove', 'checkpoint_add'])
            nm.system.disableChatCommandDisplay(command, true)

        nm.disableAutoNewGame()
        nm.disableAutoShaman()
        nm.disableAutoScore()
        nm.disableStartTimer()
        nm.disableItems()

        for (const player of nm.room.getPlayers())
            this.onNewPlayer(player.name, true)
    }

    onUnregister() {
        // Обновляем данные у игроков при respawn'е в начале игры.
        for (const [playerName, playerInfo] of Object.entries(this.playerInfos)) {
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
            if (nm.storage.has('parkour', 'map_data', map.id.toString())) {
                nm.chatMessage(coloredText(colors.global, `〢 Информация о карте @${map.id} загружена.`))
                this.mapData = JSON.parse(
                    nm.storage.get('parkour', 'map_data', map.id.toString())
                )
            } else {
                nm.chatMessage(coloredText(colors.global, `〢 Информация о карте @${map.id} не найдена.`))
                this.mapData = {}
            }
        }

        nm.setUIMapName(coloredText(colors.global, 'Parkour - season 1'))
        nm.setGameTime(300)

        if (this.mapData?.records && this.mapData.records.length > 0) {
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
            this.render(playerName)

        // Возрождаем всех!
        for (const player of nm.room.getPlayers())
            this.onPlayerDied(player.name)
    }

    onNewPlayer(playerName, init) {
        nm.setUIMapName(coloredText(colors.global, 'Parkour - season 1'), playerName)

        // Раздеваем мышку. (как в bootcamp)
        nm.room.setLook(playerName, '1;0,0,0,0')

        this.playerInfos[playerName] = {
            startAt: unix(),
            score: [0],
            textAreas: { checkpoints: [] }
        }

        for (const keyCode of [71, 32])
            nm.bindKeyboard(playerName, keyCode, true, true)

        // Обновляем картинку.
        this.render(playerName)

        if (!init) {
            nm.chatMessage(coloredText(
                    colors.self,
                    `〢 <BL>${playerName}</BL>, добро пожаловать в #parkour. Используйте клавишу G для возрождения на последнем пройденном чекпоинте, либо кликните мышью на любой, пройденный ранее (но ваш прогресс будет утерян!). Время между последним чекпоинтом и входом в нору учтено не будет.`),
                playerName
            )

            this.onPlayerDied(playerName)
        }
    }

    onPlayerDied(playerName) {
        const playerInfo = this.playerInfos[playerName]
        if (!playerInfo)
            return

        nm.respawnPlayer(playerName)
        if (playerInfo.score?.length > 0) {
            const checkpoint = this.mapData.checkpoints[playerInfo.score.length - 1]
            nm.movePlayer(playerName, checkpoint.x, checkpoint.y, 0, 0, 0, 0)
        }
        playerInfo.startAt = unix()
    }

    onPlayerWon(playerName) {
        // Тут мы учитываем только если прошел через все чекпоинты.
        const playerInfo = this.playerInfos[playerName]
        if (!playerInfo || !this.mapData?.checkpoints)
            return

        if (playerInfo.score.length !== this.mapData.checkpoints.length) {
            nm.chatMessage(coloredText(
                colors.self,
                `〢 <BL>${playerName}</BL>, вы упустили один из чекпоинтов, поэтому ваша статистика не будет учтена.`),
                playerName
            )
            this.onPlayerDied(playerName)
            return
        }

        // Количество побитых рекордов чекпоинтов.
        let bestCheckpointsAmount = 0
        let totalTime = 0
        for (const [id, time] of Object.entries(playerInfo.score)) {
            totalTime += time

            const checkpoint = this.mapData.checkpoints[id]
            if (checkpoint.records) {
                const lastRecord = checkpoint.records[checkpoint.records.length - 1]
                if (time < lastRecord.time) {
                    checkpoint.records.push({
                        playerName,
                        time,
                        createdAt: unix()
                    })
                    bestCheckpointsAmount++
                }
            } else {
                checkpoint.records = [{ playerName, time, createdAt: unix() }]
                bestCheckpointsAmount++
            }
        }

        nm.chatMessage(coloredText(
                colors.self,
                `〢 <BL>${playerName}</BL>, ваше суммарное время прохождение карты составило: <font color='#C4A7C6'>${(totalTime / 1000).toFixed(2)}</font> сек.`),
            playerName
        )

        if (this.mapData.records) {
            const lastRecord = this.mapData.records[this.mapData.records.length - 1]
            if (totalTime < lastRecord.time) {
                this.mapData.records.push({
                    playerName,
                    time: totalTime,
                    createdAt: unix()
                })

                nm.chatMessage(coloredText(
                    colors.global,
                    `〢 <BL>${playerName}</BL> установил новый рекорд прохождения карты: <font color='#C4A7C6'>${(totalTime / 1000).toFixed(2)}</font> сек.`
                ))
            }
        } else {
            this.mapData.records = [{
                playerName,
                time: totalTime,
                createdAt: unix()
            }]

            nm.chatMessage(coloredText(
                colors.global,
                `〢 <BL>${playerName}</BL> установил новый рекорд прохождения карты: <font color='#C4A7C6'>${(totalTime / 1000).toFixed(2)}</font> сек.`
            ))
        }
        this.onPlayerDied(playerName)
    }

    onKeyboardInput(playerName, keyCode, down, posX, posY) {
        const playerInfo = this.playerInfos[playerName]
        if (!playerInfo)
            return

        switch (keyCode) {
            case 71: // G
                nm.killPlayer(playerName)
                break
            case 32: // Space
                // Все чекпоинты взял, значит ничего уже не нужно.
                if (playerInfo.score.length >= this.mapData.checkpoints.length)
                    break

                const id = playerInfo.score.length
                const checkpoint = this.mapData.checkpoints[id]
                if (Math.abs(checkpoint.x - posX) > 33 || Math.abs(checkpoint.y - posY) > 33)
                    break

                const time = unix() - playerInfo.startAt

                // if (checkpoint.records && checkpoint.records.length > 0) {
                //     const lastRecord = checkpoint.records[checkpoint.records.length - 1]
                //     if (time < lastRecord.time) {
                //         nm.chatMessage(coloredText(
                //                 colors.self,
                //                 `〢 <BL>${playerName}</BL>, вы прошли чекпоинт №${id} быстрее, чем рекордсмен карты на <font color='#C4A7C6'>${((lastRecord.time - time) / 1000).toFixed(2)}</font> сек. Вперёд!`),
                //             playerName
                //         )
                //     }
                // }

                playerInfo.score.push(time)
                playerInfo.startAt = unix()

                // Помечаем портал пройденным.
                nm.ui.updateTextArea(
                    id,
                    formatCheckpoint(id, checkpoint, playerInfo),
                    playerName
                )
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

                if (this.mapData?.checkpoints?.length > id) {
                    playerInfo.startAt = unix()

                    const checkpoint = this.mapData.checkpoints[id]
                    nm.respawnPlayer(playerName)
                    nm.movePlayer(playerName, checkpoint.x, checkpoint.y, 0, 0, 0, 0)
                }

                break
        }
    }

    onChatCommand(playerName, command) {
        if (command === '')
            return

        if (!moderators.includes(playerName))
            return

        // Комманды только для модераторов здесь.
        const args = command.split(' ')

        switch (args[0]) {
            case 'next':
                // Если предыдущая карта была обработана нами.
                if (this.mapId !== 0) {
                    // Обновляем информацию о предыдущей карте.
                    nm.storage.set('parkour', 'map_data', this.mapId.toString(), JSON.stringify(this.mapData))
                    nm.chatMessage(`Карта сохранена.`, playerName)
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

                if (this.mapData && this.mapData.checkpoints && this.mapData.checkpoints[checkpointID]) {
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

                if (this.mapData) {
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
                }
                break
            case 'checkpoint_remove':
                if (args.length !== 2)
                    return

                const id = parseInt(args[1])
                if (this.mapData) {
                    if (this.mapData.checkpoints)
                        if (this.mapData.checkpoints.length > id) {
                            this.mapData.checkpoints.splice(id, 1)

                            nm.chatMessage(`Чекпоинт №${id} удален.
                            `, playerName)
                        }

                    // Обновляем картинку у всех при удалении.
                    for (const otherPlayerName of Object.keys(this.playerInfos))
                        this.render(otherPlayerName)
                }
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

                console.log(this.mapData)
                let index = -1
                if (this.mapData) {
                    // Если у карты уже есть чекпоинты, то добавляем.
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
                        this.render(otherPlayerName)
                }
        }
    }

    onLoop(time, remaining) {
        if (!this.started) {
            nm.newGame('#78')
            this.started = true
        }

        // Unsigned int. FIXME: починить.
        if (remaining >= 100000000)
            nm.newGame('#78')
    }
}

const main = new Main()

register(
    'parkour',
    toModuleObject(main),
    true
)

