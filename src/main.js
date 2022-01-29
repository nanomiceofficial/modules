import Home from './home'

import UI from './plugins/ui'
import Hello from './plugins/hello'
import Fly from './plugins/fly'
import Deathmatch from './plugins/deathmatch'
import Commandor from './plugins/commandor'

const home = new Home({
    ui: {
        mapName: 'Home'
    },
    plugins: [
        new UI(),
        new Hello(),
        new Fly(),
        new Deathmatch({ enabled: false }),
        new Commandor()
    ]
})

register('home', home.getModule(), true)