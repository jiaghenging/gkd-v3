import axios from 'axios';
// import { ElMessage } from 'element-plus'
import url_config from '../config/index.config.js'
export function request(config) {
    const instance = axios.create({
        baseURL: url_config,
        timeout: 10000
    })
    // 添加请求拦截器
    instance.interceptors.request.use(
        (config) => {
            if (localStorage.getItem('Authorization')) {
                config.headers["Authorization"] = localStorage.getItem('Authorization');
              }
            console.log(config);
            return config;
          }, (error)=> {
        // 对请求错误做些什么
        return Promise.reject(error);
    });

    // 添加响应拦截器
    instance.interceptors.response.use(
        (res)=> {
        console.log(res);
        if(res.data.state==3){
            
        }
        // 2xx 范围内的状态码都会触发该函数。
        // 对响应数据做点什么
        return res;
    },  (error) =>{
        // 超出 2xx 范围的状态码都会触发该函数。
        // 对响应错误做点什么
        if(error.response){
            if(error.status==500){
                alert('服务器内部错误')
            }
        }
        return Promise.reject(error);
    });
    // 发送真正的网络请求
    return instance(config);
}