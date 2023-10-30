import { request } from "../utils/request";
// 登录
export function getYy(params){
    return request({
        url:'/getyylist',
        method:'POST',
        data:params
    })
}
