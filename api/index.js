import {
	request
} from "../utils/request";
// 登录
export function login(params) {
	console.log(params);
	return request(
		'/login',
		'POST',
		params
	)
}