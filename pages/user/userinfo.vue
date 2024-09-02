<template>
	<view class="content">
		<view class="status_bar">
			<!-- 这里是状态栏 -->
		</view>
		<view class="bgBox">
			<view class="zzc"></view>
			<image class="bg-img" src="../../static/img/bg_login.jpg"></image>
		</view>
		<view class="container">
			<view class="button_list">
				<i class="iconfont icon-shezhi" @tap="showSetting()"></i>
			</view>
			<text>个人中心</text>
			<view @tap="loginOut()">退出登录</view>
		</view>
		<!-- 弹出层 -->
		<uni-drawer ref="settingRef" mode="right" :mask-click="false" @change="change($event,'showRight')">
			<view class="scroll-view setting_box">
				<scroll-view class="scroll-view-box" scroll-y="true">
					<view class="flex-center" @click="hideSetting('showRight')">
						<text class="text-center">设置</text>
					</view>
					<view class="info-content" v-for="item in 100" :key="item">
						<text>可滚动内容 {{item}}</text>
					</view>
					<view class="close">
						<button @click="hideSetting('showRight')"><text class="word-btn-white">关闭Drawer</text></button>
					</view>
				</scroll-view>
			</view>
		</uni-drawer>
	</view>
</template>

<script setup>
	import {
		reactive,
		ref
	} from 'vue';

	const settingRef = ref(null)
	const showSetting=function(){
		settingRef.value.open();
	}
	const hideSetting=function(){
		settingRef.value.close();
	}
	const loginOut = function() {
		uni.showModal({
			title: '提示',
			content: '是否退出登录?',
			success: function(res) {
				uni.setStorage({
					key: 'user_msg',
					data: '',
					success() {
						if (res.confirm) {
							uni.redirectTo({
								url: '/pages/login/login'
							})
						} else if (res.cancel) {
							console.log('用户点击取消');
						}

					}
				})
				uni.setStorageSync('Authorization', '')
			}
		})
	}
</script>

<style lang="scss" scoped>
	@import '../../static/css/user/userInfo.scss';
</style>