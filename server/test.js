import { TEMPLATE_USER_HEADER_ROW, USER_HEADER_ROW } from "./constants/common.js";
import { initSheet } from "./services/dataService.js";
import { getLastUID } from "./services/userService.js";


const query = await getLastUID()
console.log(query)
const sheet = (await initSheet('11PzLthgKxIg6a70ZRQkFAWSxG5qEP_e4HIULGKNzhJM', 'users', TEMPLATE_USER_HEADER_ROW)).data

const rows = await sheet.getRows({
    offset: 0
})

const users = rows.map(row => ({
    userId: row.get(TEMPLATE_USER_HEADER_ROW[0]),
    role: row.get(TEMPLATE_USER_HEADER_ROW[1]),
    deviceIp: row.get(TEMPLATE_USER_HEADER_ROW[2]),
    name: row.get(TEMPLATE_USER_HEADER_ROW[3]),
    displayName: row.get(TEMPLATE_USER_HEADER_ROW[4]),
    password: row.get(TEMPLATE_USER_HEADER_ROW[5]),
}))
console.log(users)