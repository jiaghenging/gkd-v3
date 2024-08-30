<script>
	export default {
		globalData: {
			userMsg:{
				userid:'',
				username:'',
				yystate:0
			}
		},
		onLaunch: function() {
			console.warn('当前组件仅支持 uni_modules 目录结构 ，请升级 HBuilderX 到 3.1.0 版本以上！')
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	@import 'static/css/public/iconfont.css';
	@import 'static/css/public/public.css';
	/*每个页面公共css */
	uni-page-body,page {
		height:100%
	}
</style>