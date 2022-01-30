export default {
    home: 'Home',

    // UI
    ui: {
        name: 'UI',
        description: 'Provides an user interface for managing the room.',
        players: 'Players',
        owner: 'Owner',
        addRights: 'Not admin',
        removeRights: 'Admin',
        plugins: 'Plugins',
        close: 'Close',
        enable: 'Enable',
        disable: 'Disable',
        disclaimer: 'This is an experimental module.',
        addedAdmin: 'Player <V>{0}</V> is now an admin.',
        removedAdmin: 'Player <V>{0}</V> is no longer an admin.',
        pluginEnabled: 'Plugin <N>{0}</N> has been enabled.',
        pluginDisabled: 'Plugin <N>{0}</N> has been disabled.',
        forbidden: '<R>You are not in the list of room administrators..'
    },

    hello: {
        name: 'Friend',
        description: 'Greets those who enter the room and says goodbye to those who went out.',
        joinedRoom: '<V>{0}</V> joined the room.',
        leftRoom: '<V>{0}</V> left the room.'
    },

    fly: {
        name: 'Fly',
        description: 'Fly by spacebar.'
    },

    deathmatch: {
        name: 'Deathmatch',
        description: 'Cannon battle. You can change position of cannon with !off command, and you can change cannon with !ct command.',
        offset: 'Offset: X {0} | Y {1}',
        use: 'Use: {0}'
    },

    commandor: {
        name: 'Commandor',
        description: `Provides some useful commands for room, which only admin can use:
1. !message Message - send message from room.
2. !new bootcamp/vanilla/racing/defilante/tribe/survivor/village - start next map by type.
3. !cheese Nickname - give cheese to player.
4. !takecheese Nickname - take cheese from player.
5. !win Nickname - move player to hole. (only if he has cheese)
6. !autorespawn - enable/disable auto respawn in room.
7. !notime - infinity map time.
8. !time Seconds - set game time.
9. !sha Nickname - make player shaman.
10. !nosha - enable/disable shaman
11. !snow Seconds - start snow.
12. !gravity Seconds Number - set gravity. 
13. !meep Nickname - give meep to player.
14. !kill Nickname - kill player. `,
        autorespawn: 'Autorespawn: {0}'
    }
}