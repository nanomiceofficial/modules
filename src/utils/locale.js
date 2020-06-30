import EN from "./translations/en"
import RU from "./translations/ru"

export default {
    type: {
        none: 0,
        all: 1,
        self: 2
    },

    get: function (key, type = 0) {
        let locale
        switch (nm.Room.CommunityName) {
            case "RU":
                locale = RU
                break
            default:
                locale = EN
                break
        }

        let value
        for (let part of key.split("/")) {
            if (value == undefined)
                value = locale[part]
            else
                value = value[part]
        }

        switch (type) {
            case this.type.all:
                return `<font color="#AAAAAA">Ξ [${locale["home"]}] ${value}</font>`
            case this.type.self:
                return `<J># <BL>${value}`
        }

        return value
    }
}