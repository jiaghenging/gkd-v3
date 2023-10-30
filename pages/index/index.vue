<template>
	<view class="content" >
		<view class="bgBox">
			<view class="zzc"></view>
			<image class="bg-img" src="../../static/img/bg_login.jpg"></image>
		</view>
		<view class="yuyueListBox">
			<view class="yyCard" v-for="(item_g,index_g) in groupMsg">
				<view class="yyCard_top">
					<view class="yy_master_img">
						<image src="../../static/img/yuyue/tx.png" mode=""></image>
					</view>
					<view class="yy_master_txt">
						<text class="master_name" v-if="item_g.master">ID : {{item_g.master.mastername}}</text>
					</view>
					<view class="outyyBtn" v-if="ifhas(item_g)" @tap="outYy(item_g.id,index_g,item_g.teammsg,item_g.master.masterid)">
						<text class="iconfont icon-tuichu"></text>
					</view>
				</view>
				<view class="yyMsgBox">
					<text class="yymsg_title">{{item_g.title}}</text>
					<view class="groupBox">
						<view class="group_item" v-for="(item_t,index_t) in item_g.teammsg" :key="index_t">
							<view class="joinBtn" v-if="item_t.id==''" @tap="beforeJoin(item_g.id,item_g.master)">
								<text class="iconfont icon-jiahao"></text>
							</view>
							<view class="g_item_name" v-if="item_t.id!=''">
								{{item_t.name | ellipsis}}
							</view>
						</view>

					</view>
				</view>
			</view>
			<view class="btn_message" v-if="ifMaster()" @click="showMessageList()">
				<text class="iconfont icon-xiaoxi"></text>
				<text class="newMsgTip" v-show="haveNew">{{messageList.length}}</text>
				
			</view>
			<view class="btn_addyy" @tap="addYuyue()">
				<text class="iconfont icon-chuangjian"></text>
			</view>
			

		</view>
		<!-- 弹出层 -->
		<uni-popup ref="popup" :mask-click="false">
			<view class="msgListBox">
				<view class="msg_close_btn" @click="closeMessage()">
					<text class="iconfont icon-guanbi"></text>
				</view>
				<view class="msgList_content">
					<view class="msgList_item" v-for="(item,index) in messageList" :key="index">
						<view class="item_text">标题:{{item}} </view>
						<text class="iconfont icon-guanbi" @click="delMsg(index)"></text>
					</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import {getYy} from './'
	export default {
		data() {
			return {
				messageList:[],
				ifCanCLick:true,
				ifShowMsg:true,
				wb: '',
				title: 'Hello',
				userMsg: '',
				user_yystate: 0, //0为未加入1为已加入
				haveNew:false,
				msgnum:0,
				groupMsg: [{
					id: '1',
					num: 5,
					master: {
						masterid: 'jianghenging',
						mastername: 'HEXA丶JH'
					},
					teammsg: [{
							id: '1',
							name: '慢慢当第一'

						},
						{
							id: '',
							name: ''
						},
						{
							id: '',
							name: ''
						},
						{
							id: '',
							name: ''
						}
					]
				}]
			}
		},
		filters: {
			ellipsis(value) {
				if (!value) return '';
				if (value.length > 4) {
					return value.slice(0, 4) + '..'
				}
				return value
			}
		},
		onShow() {
			const that = this;
			uni.getStorage({
				key: 'user_msg',
				success: function(res) {
					that.userMsg = res.data;
				}
			});
			let yystateP = that.checkyystate();
			yystateP.then((res) => {
				that.user_yystate = res;
			}).catch(err => {
				that.user_yystate = err;
			})
			that.getYyList();
			that.checkMessage();
			// that.initWebsockt();
		},
		methods: {
			delMsg(currentIndex){
				const that=this;
				if(that.ifCanCLick){
					
				}
			},
			showMessageList(){
				const that=this;
				that.ifShowMsg=false;
				this.$refs.popup.open('center')
			},
			closeMessage(){
				const that=this;
				that.ifShowMsg=true;
				this.$refs.popup.close()
			},
			initWebsockt() {
				const that = this;
				that.wb = uni.connectSocket({
					url: 'ws://192.168.31.69:8091',
					success: () => {
						console.log("正在建立链接");
						// return that.wb;
					},
				});
				that.wb.onMessage((res)=>{
					console.log(res);
					if(res.data=='message'){
						that.checkMessage();
					}
				})
				that.wb.onOpen(res => {
					console.log("WebSocket连接成功", res)
				})

			},
			checkMessage(){
				const that=this;
				that.$api.postMsg('/getmessagelist',{userid:that.userMsg.userid}).then(res=>{
					if(res.data.length>0){
						that.haveNew=true;
						that.msgnum=res.data.length;
						that.messageList=res.data;
						console.log(that.messageList);
					}
				})
			},
			testwb(msg) {
				const that = this;
				let txt = msg;
				that.wb.send({
					data: JSON.stringify({
						msg: 'test'
					})
				});
				
			},
			ifMaster() {
				const that = this;
				let ifhase = false;
				that.groupMsg.forEach((item, index) => {
					console.log(item.master.masterid)
					if (item.master.masterid == that.userMsg.userid) {
						ifhase = true;
					}
				})
				that.ifShowMsg?ifhase=true:ifhase=false;
				return ifhase 
			},
			outYy(currentYyid, currentYyIndex, currentTmsg,masterId) {
				const that = this;
				let tmsg = currentTmsg.filter(item => item.id != that.userMsg.userid);
				tmsg.push({
					id: '',
					name: ''
				});
				let tmsg_json = JSON.parse(JSON.stringify(tmsg));
				for (let i = 0; i < tmsg_json.length; i++) {
					tmsg_json[i] = JSON.stringify(tmsg_json[i]);
				}
				console.log(tmsg_json)
				uni.showModal({
					title: '提示',
					content: '确认退出该预约?',
					success: function(res) {
						if (res.confirm) {
							let outYyP = that.sureOutYy(JSON.stringify(tmsg_json), currentYyid);
							outYyP.then(outres => {
								console.log(outres);
								
								that.user_yystate = 0;
								that.groupMsg[currentYyIndex].teammsg = tmsg;
								that.wb.send({
									data: JSON.stringify({
										type:'1',//2为删除
										message:that.userMsg.username+'退出了您的房间',
										masterId:masterId
									})
								});
							}).catch(err => {
								uni.showToast({
									title: "退出预约失败,请稍后再试..",
									duration: 1500,
									icon: "error"
								})
							})
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});


			},
			sureOutYy(tmsg, yyid) {
				const that = this;
				return new Promise((resolve, reject) => {
					
					that.$api.postMsg('/outyy', {
						teammsg: tmsg,
						yyid: yyid,
						userid: that.userMsg.userid
					}).then(res => {
						console.log(res)
						if (res.data.state == 0) {
							resolve(true)
						} else {
							reject(false)
						}
					})
				})
			},
			ifhas(currentItem) {
				const that = this;
				let ifthas = false;
				currentItem.teammsg.forEach((item, index) => {
					if (item.id == that.userMsg.userid) {
						ifthas = true;
					}
				})
				if (currentItem.id == that.userMsg.userid || ifthas == true) {
					return true
				} else {
					return false
				}
			},
			checkyystate() {
				const that = this;
				return new Promise((resolve, reject) => {
					that.$api.postMsg('/getyystate', {
						userid: that.userMsg.userid
					}).then(res => {
						console.log(res);
						if (res.data.state == 0 && res.data.data.yystate == 0) {
							resolve(0)
						} else {
							reject(1)
						}
					})
				})
			},
			addYuyue() {
				// 检测是否已经加入或者创建
				const that = this;
				if (that.user_yystate == 0) {
					uni.navigateTo({
						url: '/pages/index/addyuyue'
					})
				} else {
					uni.showToast({
						title: "已经加入了一个预约,不可创建预约",
						duration: 1500,
						icon: "error"
					})
				}

			},
			beforeJoin(groupId, {
				masterid: masterId,
				mastername: masterName
			}) {
				const that = this;
				uni.showModal({
					title: '提示',
					content: '确认加入' + masterName + '的房间?',
					success: function(res) {
						if (res.confirm) {
							that.sureJoin(groupId,masterId);
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
			},
			sureJoin(groupId,masterId) {
				const that = this;
				let theGroupMsg = that.groupMsg.filter(item => item.id == groupId)[0];
				let lsp = new Promise((resolve, reject) => { //先更新dom再往数据更新数据
					if (that.user_yystate == 0) {
						for (let i = 0; i < theGroupMsg.teammsg.length; i++) {
							if (theGroupMsg.teammsg[i].id == '') {
								theGroupMsg.teammsg[i].id = that.userMsg.userid;
								theGroupMsg.teammsg[i].name = that.userMsg.username;
								return resolve(true);
							}
						};
					} else {
						reject(false)
					}
				});
				lsp.then(res => {
					let tmsg = JSON.parse(JSON.stringify(theGroupMsg.teammsg));
					for (let i = 0; i < tmsg.length; i++) {
						tmsg[i] = JSON.stringify(tmsg[i]);
					}

					that.$api.postMsg('/joinyuyue', {
						yid: groupId,
						teammsg: JSON.stringify(tmsg),
						userid: that.userMsg.userid
					}).then(res => {
						console.log(res);
						if (res.data.state == 0) {
							that.user_yystate = 1;
							that.wb.send({
								data: JSON.stringify({
									type:'1',
									message:that.userMsg.username+'加入了您的房间',
									masterId:masterId
								})
							});
							
							uni.showToast({
								title: '加入房间成功2',
								duration: 1500,
								icon: 'success'
							})
						} else {
							uni.showToast({
								title: '加入房间失败',
								duration: 1500,
								icon: 'success',
								success() {
									setTimeout(() => {
										that.getYyList();
									}, 1500)
								}
							})
						}
					})
				}).catch(err => {
					uni.showToast({
						title: '您已经加入过了',
						duration: 1500,
						icon: 'error'
					})
				})


			},
			getYyList() {
				const that = this;
				//获取预约列表
				this.$api.getMsg('/getyylist').then((res) => {
					console.log(res);
					if (res.data.state == 0) {
						let gmsg = res.data.data;
						gmsg.forEach((item, index) => {
							for (let i = 0; i < item.teammsg.length; i++) {
								let a = JSON.parse(item.teammsg[i]);
								item.teammsg[i] = a;
							}
						})
						that.groupMsg = gmsg;
					}
				})
			}
		}
	}
</script>

<style>
	@import url('../../static/css/index/index.css');
</style>
