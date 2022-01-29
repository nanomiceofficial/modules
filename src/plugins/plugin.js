export default class Plugin {
    constructor(options) {
        if (new.target === Plugin)
            throw new TypeError('Cannot construct Plugin instances directly')

        this.enabled = options?.enabled !== false
    }
}