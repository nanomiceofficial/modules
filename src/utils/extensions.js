export function getAlivePlayers() {
    const alivePlayers = []

    nm.room.getPlayers().forEach(function (player, i) {
        if (!player.isDead)
            alivePlayers.push(player)
    })

    return alivePlayers
}