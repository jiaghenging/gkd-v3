<template>
	<view class="content">
		<view class="status_bar">
			<!-- 这里是状态栏 -->
		</view>
<!-- 		<view class="fixed-bg">
			<image src="../../static/img/bg_login.gif" class="bgImg" mode=""></image>
			
		</view> -->
		<view class="login_container">
			<view class="formBox">
				<text class="login_title">Hi , 你好啊</text>
				<uni-forms ref="formRef" :modelValue="userForm" :rules="rules" class="login_form">
					<uni-forms-item name="userId">
						<view class="inputBox">
							<input type="text" placeholder="请输入用户名" v-model="userForm.userId"
								placeholder-class="input_style">
						</view>
					</uni-forms-item>
					<uni-forms-item name="userPwd">
						<view class="inputBox">
							<input type="text" placeholder="请输入密码" v-model="userForm.userPwd" password="true"
								placeholder-class="input_style">
						</view>
					</uni-forms-item>
					<uni-forms-item name="ifAgree">
						<view class="form_agrement">
							<view class="checked_box" @tap="ifAgree=!ifAgree">
								<view class="agre_circle" v-show="ifAgree==false"></view>
								<view class="agre_circle2" v-show="ifAgree==true">
									<text class="iconfont icon-check"></text>
								</view>
							</view>
							<text class="agre_txt">
								我已阅读并同意
								<text class="agreement_info" @tap="toAgreement(1)">用户协议</text>
								及
								<text class="agreement_info" @tap="toAgreement(2)">隐私政策</text>
							</text>
						</view>
					</uni-forms-item>
					<uni-forms-item>
						<view class="login_btn" @tap="checkForm()">登录/注册</view>
					</uni-forms-item>
				</uni-forms>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		login
	} from '../../api/index.js'
	import {
		onMounted,
		reactive,
		ref
	} from "vue";
	import { onShow, onHide,onLoad } from "@dcloudio/uni-app"
	const videoRef=ref('')
	onShow(()=>{
		console.log(videoRef.value);
	})
	onMounted(()=>{
		console.log(videoRef.value);
	})
		const rules = {
			// 对name字段进行必填验证
			userId: {
				rules: [{
						required: true,
						errorMessage: '请输入姓名',
					},
					{
						minLength: 3,
						maxLength: 15,
						errorMessage: '姓名长度在 {minLength} 到 {maxLength} 个字符',
					}
				]
			},
			// 对email字段进行必填验证
			userPwd: {
				rules: [{
						required: true,
						errorMessage: '请输入密码',
					},
					{
						minLength: 6,
						maxLength: 14,
						errorMessage: '密码长度在 {minLength} 到 {maxLength} 个字符',
					}
				]
			}
		}
	const rulesData = ref('');

	const userForm = reactive({
		userId: '',
		userPwd: ''
	});
	
	function toLogin() {
		console.log('ssss');
		let data = {
			userid: userForm.userId,
			userpwd: userForm.userPwd,
			username: '未设置昵称'
		};
		login(data).then(res => {
			console.log(res);
			if (res.state == 0) {
				uni.showToast({
					title: '登录成功',
					duration: 1500,
					icon: 'none'
				});
				let userMsg = {
					userid: res.userid,
					username: res.username,
					yystate: res.yystate,
					token: res.token
				}
				uni.setStorage({
					key: 'Authorization',
					data: res.token,
					success() {
						console.log('成功保存');
					}
				})
				uni.setStorage({
					key: 'user_msg',
					data: userMsg,
					success() {
						setTimeout(() => {
							uni.switchTab({
								url: '../index/index'
							});
						}, 1500);
					}
				})

			}
		}).catch(err => {
			console.log(err);
		})
	}
	const formRef = ref(null);
	const ifAgree = ref(false);

	function checkForm() {
		console.log(formRef.value);
		if (ifAgree.value) {
			formRef.value.validate().then(res => {
				toLogin();

			}).catch(err => {
				console.log('失败：', err);
			})
		} else {
			uni.showToast({
				title: '请勾选同意后再进行登录奥~',
				duration: 1500,
				icon: 'none'
			})
		}
	}
	onMounted(() => {
		uni.getStorage({
			key: 'user_msg',
			success: function(res) {
				if (res.data != '' && res.data != null) {
					uni.switchTab({
						url: '../index/index'
					});
				}
			}
		});
	})
</script>

<style>
	@import url('../../static/css/login/login.scss');
</style>