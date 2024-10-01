export class Result {
    constructor(code = 200, message = ""){
        this.code = code;
        this.message = message;
    }

    isSuccess(){
        return code === 200
    }

    static Success(){
        return new Result()
    }

    static Fail(msg = ""){
        return new Result(400, msg)
    }
    
}

export class DeviceInformation{
    constructor(ip, deviceSDK){
        this.ip = ip
        this.deviceSDK = deviceSDK
    }
}