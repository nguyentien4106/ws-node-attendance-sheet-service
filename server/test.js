import { handleRealTimeData } from "./helper/dataHelper.js";

handleRealTimeData({ userId: '02678', attTime: "2000-01-01"}, 1).then(res => {
    console.log(res)
})