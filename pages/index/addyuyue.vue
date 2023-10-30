<template>
	<view class="content">
		<view class="formBox_yy">
			<uni-forms ref="yyform" :rules="rules" :model="yy_form">
				<uni-forms-item label=""  name="title">
					<!-- <inclass="yyForm_title"  auto-height placeholder-style="title_ph" placeholder="来个标题" /> -->
					<input class="yyForm_title" type="text" placeholder-style="title_ph" v-model="yy_form.title" placeholder="来个标题">
				</uni-forms-item>
				<uni-forms-item label="人数:" name="" class="numsItem">
					<uni-number-box :min="2" :max="9" v-model="yy_form.nums" ></uni-number-box>
				</uni-forms-item>
			</uni-forms>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userMsg:{
					id:'',
					name:''
				},
				rules: {
					// 对name字段进行必填验证
					title: {
						rules: [{
								required: true,
								errorMessage: '请输入标题',
							},
							{
								minLength: 1,
								maxLength: 20,
								errorMessage: '姓名长度在 {minLength} 到 {maxLength} 个字符',
							}
						]
					},
				},
				iffbz:false,
				yy_form: {
					title: '',
					nums:2
				}
			}
		},
		methods: {
			onNavigationBarButtonTap(e) {
				const that=this;
				if(e.text=='发布'){
					if(that.iffbz==false){
						that.iffbz=true;
						that.checkForm();
					}else{
						uni.showToast({
							title:'莫着急,慢点点',
							duration: 1500,
							icon: 'none'
						})
					}
					
				}
			},
			checkForm(){
				const that=this;
				that.$refs.yyform.validate().then(res => {
					console.log(that.yy_form);
					
					let date=new Date();
					let time=date.getTime();
					let formmsg={
						userid:that.userMsg.userid,
						title:that.yy_form.title,
						subtime:time,
						master:{
							masterid:that.userMsg.userid,
							mastername:that.userMsg.username
						},
						teammsg:[],
						nums:that.yy_form.nums
					}
					for(let i=0;i<formmsg.nums-1;i++){
						formmsg.teammsg.push(JSON.stringify({id:"",name:''}))
					}
					
					formmsg.master=JSON.stringify(formmsg.master)
					formmsg.teammsg=JSON.stringify(formmsg.teammsg);
					console.log(formmsg)
					uni.showModal({
						title:'提示',
						content:'立即发布预约?',
						success() {
							that.$api.postMsg('/addyy',formmsg).then(res=>{
								console.log(res);
								if(res.data.state==0){
									uni.showToast({
										title:res.data.message,
										duration: 1500,
										icon: 'success',
										success() {
											setTimeout(()=>{
												that.iffbz=false;
												uni.switchTab({
													url:'/pages/index/index'
												})
											},1500)
										}
									})
								}else{
									that.iffbz=false;
								}
							})
						},fail() {
							that.iffbz=false;
						}
					})
				}).catch(err => {
					console.log('失败：', err);
					that.iffbz=false;
				})
			}
		},
		onLoad() {
			const that=this;
			uni.getStorage({
			    key: 'user_msg',
			    success: function (res) {
					
					that.userMsg=res.data;
			    }
			});
			console.log(that.userMsg);
		}
	}
</script>

<style>
	@import url('../../static/css/index/addyy.css');
</style>
