export function unix() {
    return +new Date()
}

export function since(timestamp) {
    return unix() - timestamp
}

export function before(timestamp) {
    return timestamp - unix
}