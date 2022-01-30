import EN from './translations/en'
import RU from './translations/ru'
import { format } from './format'

export default {
    type: {
        none: 0,
        all: 1,
        self: 2
    },

    get: function (key, type = 0) {
        let locale
        switch (nm.room.communityName) {
            case 'RU':
                locale = RU
                break
            default:
                locale = EN
                break
        }

        let value
        for (let part of key.split('/')) {
            if (value === undefined)
                value = locale[part]
            else
                value = value[part]
        }

        switch (type) {
            case this.type.all:
                return `<font color='#AAAAAA'>Ξ [${locale['home']}] ${value}</font>`
            case this.type.self:
                return `<J># <BL>${value}`
        }

        return value
    },

    format: function(key, type = 0, f) {
        return format(this.get(key, type), f)
    }
}