import { request } from "../utils/request";
//POST
export function postMsg(url:String,params:Object){
    return request({
        url:url,
        method:'POST',
        data:params
    })
}
//GET
export function getMsg(url:String,params:Object){
    return request({
        url:url,
        method:'GET',
        params:params
    })
}
