<template>
	<view>
		<text>个人中心</text>
		<view @tap="loginOut()">退出登录</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			}
		},
		methods: {
			loginOut(){
				const that=this;
				uni.showModal({
					title:'提示',
					content:'是否退出登录?',
					success: function (res) {
						uni.setStorage({
							key:'user_msg',
							data:'',
							success() {
								if (res.confirm) {
									uni.redirectTo({
										url:'/pages/login/login'
									})
								} else if (res.cancel) {
									console.log('用户点击取消');
								}
								
							}
						})
					}
				})
			}
		}
	}
</script>

<style>

</style>
