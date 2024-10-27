import { getSettings } from "./services/settingsService.js"

const settings = await getSettings()
    const toEmail = settings.rowCount ? settings.rows[0].Email : "nguyenvantien0620trip@gmail.com"
console.log(toEmail)