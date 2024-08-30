import { request } from "../utils/request";
//POST
export function postMsg(url : String, params : Object) {
	return request(
		url,
		'POST',
		params
	)
}
//GET
export function getMsg(url : String, params : Object) {
	return request(
		url,
		'GET',
		params
	)
}