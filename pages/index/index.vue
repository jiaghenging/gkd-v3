<template>
	<view class="content">
		<view class="status_bar">
			<!-- 这里是状态栏 -->
		</view>
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
					<view class="outyyBtn" v-if="ifhas(item_g)"
						@tap="outYy(item_g.id,index_g,item_g.teammsg,item_g.master.masterid)">
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
								{{item_t.name}}
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

<script setup>
	import {
		postMsg,
		getMsg 
	} from "@/api/api.ts"
	import {
		onLoad,
		onShow
	} from "@dcloudio/uni-app";
	import {
		reactive,
		ref
	} from 'vue';
	// import {getYy} from './'
	const messageList = ref([]);
	const ifCanCLick = ref(true);
	const ifShowMsg = ref(true);
	const wb = reactive({});
	const title = ref('Hello');
	const userMsg = ref('');
	const user_yystate = ref(0); //0为未加入1为已加入
	const haveNew = ref(false);
	const msgnum = ref(0);
	const groupMsg = ref([{
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
	}]);
	onShow(() => {
		uni.getStorage({
			key: 'user_msg',
			success: function(res) {
				userMsg.value = res.data;
			}
		});
		let yystateP = checkyystate();
		yystateP.then((res) => {
			user_yystate.value = res;
		}).catch(err => {
			user_yystate.value = err;
		})
		getYyList();
		checkMessage();
		// that.initWebsockt();
	})
	const delMsg = function(currentIndex) {
		if (ifCanCLick.value) {

		}
	}
	const showMessageList = function() {
		ifShowMsg.value = false;
		// this.$refs.popup.open('center')
	}
	const closeMessage = function() {
		ifShowMsg.value = true;
		// this.$refs.popup.close()
	}
	const initWebsockt = function() {
		wb = uni.connectSocket({
			url: 'ws://192.168.31.69:8091',
			success: () => {
				console.log("正在建立链接");
				// return that.wb;
			},
		});
		wb.onMessage((res) => {
			console.log(res);
			if (res.data == 'message') {
				checkMessage();
			}
		})
		wb.onOpen(res => {
			console.log("WebSocket连接成功", res)
		})

	}
	const checkMessage = function() {
		postMsg('/getmessagelist', {
			userid: userMsg.value.userid
		}).then(res => {
			if (res.data.length > 0) {
				haveNew.value = true;
				msgnum.value = res.data.length;
				messageList.value = res.data;
				console.log(messageList.value);
			}
		})
	}
	const testwb = function(msg) {
		let txt = msg;
		wb.send({
			data: JSON.stringify({
				msg: 'test'
			})
		});

	}
	const ifMaster = function() {
		let ifhase = false;
		groupMsg.value.forEach((item, index) => {
			console.log(item.master.masterid)
			if (item.master.masterid == userMsg.value.userid) {
				ifhase = true;
			}
		})
		ifShowMsg.value ? ifhase = true : ifhase = false;
		return ifhase
	}
	const outYy = function(currentYyid, currentYyIndex, currentTmsg, masterId) {
		let tmsg = currentTmsg.filter(item => item.id != userMsg.value.userid);
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
					let outYyP = sureOutYy(JSON.stringify(tmsg_json), currentYyid);
					outYyP.then(outres => {
						console.log(outres);

						user_yystate.value = 0;
						groupMsg[currentYyIndex].teammsg = tmsg;
						wb.send({
							data: JSON.stringify({
								type: '1', //2为删除
								message: userMsg.value.username + '退出了您的房间',
								masterId: masterId
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
	}
	const sureOutYy = function(tmsg, yyid) {
		return new Promise((resolve, reject) => {
			postMsg('/outyy', {
				teammsg: tmsg,
				yyid: yyid,
				userid: userMsg.value.userid
			}).then(res => {
				console.log(res)
				if (res.code == 200) {
					resolve(true)
				} else {
					reject(false)
				}
			})
		})
	}
	const ifhas = function(currentItem) {
		let ifthas = false;
		currentItem.teammsg.forEach((item, index) => {
			if (item.id == userMsg.value.userid) {
				ifthas = true;
			}
		})
		if (currentItem.id == userMsg.value.userid || ifthas == true) {
			return true
		} else {
			return false
		}
	}
	const addYuyue = function() {
		// 检测是否已经加入或者创建
		if (user_yystate.value == 0) {
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

	}
	const checkyystate = function() {
		return new Promise((resolve, reject) => {
			postMsg('/getyystate', {
				userid: userMsg.value.userid
			}).then(res => {
				console.log(res);
				if (res.code == 200 && res.data.data.yystate == 0) {
					resolve(0)
				} else {
					reject(1)
				}
			})
		})
	}
	const beforeJoin = function(groupId, {
		masterid: masterId,
		mastername: masterName
	}) {
		uni.showModal({
			title: '提示',
			content: '确认加入' + masterName + '的房间?',
			success: function(res) {
				if (res.confirm) {
					sureJoin(groupId, masterId);
				} else if (res.cancel) {
					console.log('用户点击取消');
				}
			}
		});
	}
	const sureJoin = function(groupId, masterId) {
		let theGroupMsg = groupMsg.filter(item => item.id == groupId)[0];
		let lsp = new Promise((resolve, reject) => { //先更新dom再往数据更新数据
			if (user_yystate.value == 0) {
				for (let i = 0; i < theGroupMsg.teammsg.length; i++) {
					if (theGroupMsg.teammsg[i].id == '') {
						theGroupMsg.teammsg[i].id = userMsg.value.userid;
						theGroupMsg.teammsg[i].name = userMsg.value.username;
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
			postMsg('/joinyuyue', {
				yid: groupId,
				teammsg: JSON.stringify(tmsg),
				userid: userMsg.value.userid
			}).then(res => {
				console.log(res);
				if (res.code == 200) {
					user_yystate.value = 1;
					wb.send({
						data: JSON.stringify({
							type: '1',
							message: userMsg.value.username + '加入了您的房间',
							masterId: masterId
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
								getYyList();
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


	}
	const getYyList = function() {
		//获取预约列表
		getMsg('/getyylist').then((res) => {
			console.log(res);
			if (res.code == 200) {
				let gmsg = res.data.data;
				gmsg.forEach((item, index) => {
					for (let i = 0; i < item.teammsg.length; i++) {
						let a = JSON.parse(item.teammsg[i]);
						item.teammsg[i] = a;
					}
				})
				groupMsg = gmsg;
			}
		})
	}
	// export default {
	// 	filters: {
	// 		ellipsis(value) {
	// 			if (!value) return '';
	// 			if (value.length > 4) {
	// 				return value.slice(0, 4) + '..'
	// 			}
	// 			return value
	// 		}
	// 	},

	// }
</script>

<style lang="scss">
	@import '../../static/css/index/index.scss';
</style>