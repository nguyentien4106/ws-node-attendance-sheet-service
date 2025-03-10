import { logger } from "../config/logger.js";

export class Result {
    constructor(code = 200, message = "", data){
        this.code = code;
        this.message = message;
        this.data = data
        this.isSuccess = code === 200
    }

    // isSuccess = this.code === 200

    static Success(data = null, message= ""){
        return new Result(200, message, data)
    }

    static Fail(err = 500, msg = "", data = null){
        logger.error(msg)
        return new Result(err, msg, data)
    }
    
}

export class DeviceInformation{
    constructor(ip, deviceSDK){
        this.ip = ip
        this.deviceSDK = deviceSDK
    }
}

