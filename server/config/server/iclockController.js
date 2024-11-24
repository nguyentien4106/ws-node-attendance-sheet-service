import url from 'url'
import { logger } from '../logger.js'
import dayjs from 'dayjs'
import { DATABASE_DATE_FORMAT, TIME_FORMAT } from '../../constants/common.js'
import { handleRealTimeDataBySN } from '../../helper/dataHelper.js'

const parseQueryString = (URL) => {
    return url.parse(URL, true).query
}

export const handShake = async (req, res) => {
    console.log(`${req.method} request ${req.url}`)
    const params = parseQueryString(req.url)
    const response = `GET OPTION FROM: ${params["SN"]}\r\nATTLOGStamp=9999\r\nOPERLOGStamp=9999\r\nATTPHOTOStamp=None\r\nErrorDelay=15\r\nDelay=5\r\nTransTimes=00:00;08:00;09:00;10:00;11:00;12:00;13:00;14:00;15:00;16:00\r\nTransinterval=1\r\nTransFlag=1000000000\r\nServerVer=2.2.1\r\nRealtime=1\r\nEncrypt=None`
    console.log('handshake response', response)
    logger.info(`handshake response ${response}`)
    res.setHeader("Date", new Date().toUTCString())
    res.send(response)

    return response
}

export const getRequest = async (req, res) => {
    console.log(`GET request ${req.url}`)
    res.send("OK")

    return "OK"
}

export const handleNewRecord = async(req, res) => {
    console.log(`${req.method} request ${req.url}`)

    let logs = []
    const SN = parseQueryString(req.url)["SN"]

    req.on("data", (chunk) => {
        const data = chunk.toString("ascii").split("\r\n")
        logs = data.map(item => item.split("\t"))
    })

    req.on('end', async() => {
        let count = 0;
        for(const log of logs){
            const att = {
                userId: log[0],
                attTime: dayjs(log[1]).format(DATABASE_DATE_FORMAT + " " + TIME_FORMAT),
            };
            console.log(att)
            const handleRealTimeResult = await handleRealTimeDataBySN(att, SN)
            if(handleRealTimeResult.isSuccess){
                count++;
            }
        }
        const response = "OK: " + count;
        console.log(response)
        res.send(response)

        return response
        
    })
}