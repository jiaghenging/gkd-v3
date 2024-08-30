import url_config from '../config/index.config.js'
export function request(url, method, data) {
	console.log('url',url);
  return new Promise((resolve, reject) => {
	  let fullUrl=url_config+url;
	  console.log(fullUrl);
		uni.request({
      url: fullUrl,
      method: method,
      data: data,
      success: (res) => {
        resolve(res.data);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}
