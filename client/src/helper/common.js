export const getServerIp = () => localStorage.getItem("server-ip")

export const setServerIp = value => localStorage.setItem("server-ip", value)

export const getHostUrl = () => `ws://${getServerIp() ?? "127.0.0.1"}:3002`

export const getAPIUrl = () => `http://${getServerIp()}:3002`

export const isAuth = sessionStorage.getItem("auth") != null ? true : false