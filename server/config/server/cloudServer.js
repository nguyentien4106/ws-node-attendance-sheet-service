import http from "http";
import url from "url";
import { handleRealTimeDataBySN } from "../../helper/dataHelper.js";
import "dotenv/config"
import dayjs from "dayjs";
import { DATABASE_DATE_FORMAT, TIME_FORMAT } from "../../constants/common.js";

export const initializeCloudServer = () => {
    const cloudServer = http.createServer(async (req, res) => {
        console.log(`URL: ${req.url}`);
        console.log(`Method: ${req.method}`);
        console.log(`Headers:`, req.headers);

        if (req.method === "GET") {
            res.end("GET request 200");
            return;
        }

        const URL = url.parse(req.url, true);
        const SN = URL.query["SN"];
        let logs = [];

        req.on("data", (chunk) => {
            const opLogs = chunk.toString("ascii").split("\n");
            logs = opLogs.map((log) => log.split("\t"));
        });

        req.on("end", async () => {
            const result = []
            for (const log of logs) {
                const att = {
                    userId: log[0].trim() === "OPLOG" ? log[1] : log[0],
                    attTime: dayjs(log[0].trim() === "OPLOG" ? log[2] : log[1]).format(DATABASE_DATE_FORMAT + " " + TIME_FORMAT),
                };
                console.log(att)
                result.push(await handleRealTimeDataBySN(att, SN));
            }

            res.end(`POST request: ${JSON.stringify(result)}` );
        });
    });

    const PORT = process.env.CLOUD_SERVER || 8081;

    cloudServer.listen(PORT, () => {
        console.log(`Cloud Server is listening on port ${PORT}`);
    });
};
