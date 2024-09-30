export class Result {
    constructor(code = 200, message = ""){
        this.code = code;
        this.message = message;
    }

    static Success(){
        return new Result()
    }
    
}

export class DeviceInformation{
    constructor(ip, device){
        this.ip = ip
        this.device = device
    }
}