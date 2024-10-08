import url_config from '../config/index.config.js'
export function request(url, method, data) {
	let header = {
		'content-type': 'application/json',
	};
	// const token = store.state.token
	
	let token=uni.getStorageSync('Authorization')
	if (token) {
		console.log('token',token);
		header.Authorization = token;
	}
  return new Promise((resolve, reject) => {
    let fullUrl = url_config + url;
    uni.request({
      url: fullUrl,
	  data: data,
      method: method,
	  header:header,
      success: (res) => {
		  console.log('11111');
        resolve(res.data);
      },
      fail: (err) => {
		    console.log('2222');
        reject(err);
      }
    });
  });
}
