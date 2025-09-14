<template>
	<view>
		<!-- 显示RSS内容 -->
		<view v-for="(item, index) in rssData.items" :key="index">
			<u-card :title="item.title" :sub-title="subTitle" :thumb="thumb" border-radius="30">
				<template #body>
					<view class="u-body-item u-flex u-border-bottom u-col-between u-p-t-0">
						<view class="u-body-item-title u-line-2">{{ item.description }}</view>
						<image
							:src="item.thumbnail._url"
							mode="aspectFill"></image>
					</view>
				</template>
			</u-card>
		</view>
	</view>
	<view class="container">
		<u-toast ref="uToast" />
		<u-popup v-model="show" mode="bottom" border-radius="12" length="60%">
			<u-row gutter="16">
				<u-col span="12">
					<view class="demo-layout bg-purple">
						<view><u-input v-model="rss_url" :type="type" :border="border" :placeholder="placeholder" />
						</view>
						<u-button @click="send()">订阅</u-button>
					</view>
				</u-col>
			</u-row>
		</u-popup>
		<div class="plus_button">
			<u-button type="primary" @click="show = true"><u-icon size="14" name="plus"></u-icon></u-button>
		</div>
	</view>
</template>

<script>
	import X2JS from 'x2js'
	export default {
		data() {
			return {
				show: false,
				rss_url: '',
				type: 'text',
				border: true,
				placeholder: '请输入RSS链接',
				rssData: {
					title: '',
					items: []
				}
			}
		},
		methods: {
			send() {
				// 将请求URL改为通过代理服务访问
				const encodedUrl = encodeURIComponent(this.rss_url);
				const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodedUrl;
				uni.request({
					url: proxyUrl,
					method: 'GET',
					success: (res) => {
						const xmlText = res.data;
						const x2js = new X2JS();
						const jsonData = x2js.xml2js(xmlText);
						this.rssData = {
							title: jsonData.rss.channel.title || '',
							items: Array.isArray(jsonData.rss.channel.item) ?
								jsonData.rss.channel.item : [jsonData.rss.channel.item || {}]
						};
						this.$forceUpdate();
						console.log('检查数据:', this.rssData);
						console.log('json数据：', jsonData)
					},
					fail: (err) => {
						console.log('请求失败:', err)
					},
				})
			}
		}
	}
</script>

<style scoped lang="scss">
	.container {
		position: relative;
		padding: 24rpx;
	}

	.plus_button {
		width: 10rpx;
		height: 10rpx;
		bottom: 200rpx;
		border-radius: 50px;
		display: flex;
		position: fixed;
		right: 100rpx;
		justify-content: center;
		align-items: center;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.3);
		z-index: 999;

	}

	.u-row {
		margin: 40rpx 0;
	}

	.u-card-wrap {
		background-color: $u-bg-color;
		padding: 1px;
	}

	.u-body-item {
		font-size: 32rpx;
		color: #333;
		padding: 20rpx 10rpx;
	}

	.u-body-item image {
		width: 120rpx;
		flex: 0 0 120rpx;
		height: 120rpx;
		border-radius: 8rpx;
		margin-left: 12rpx;
	}
</style>