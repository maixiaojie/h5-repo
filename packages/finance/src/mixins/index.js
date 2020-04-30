import Vue from 'vue'
import Component from 'vue-class-component'
import {share_init,getBaseEnvironment,query,sentry_init,sa_init,get_user_base_info,sharewx,toast} from 'hd-sdk-dev'
import {get_page_config,awaitWrap} from '../utils/api.js'
@Component
export default class indexMixin extends Vue {
  page_img = null
  user_info = null
  user_id = query('user_id') || ''
  pid = query('pid') || '' // 投放渠道
  channel_id = parseInt(query('channel_id') || process.env.CHANNEL_ID) // 注册渠道id
  channel = query('channel') || query('channel_type') || '' // 页面来源
  share_uid = query('share_uid') || query('ambass_id') || '' // 分享人信息
  xcx_open_id = query('xcx_open_id') || '' // 判断小程序环境
  euler_id = query('euler_id') || '' // 欧拉id 图片统计
  environment = getBaseEnvironment()
  showLogin = false
  @sa_init
  @sentry_init
  // page_id 页面id用于埋点; activity_id活动配置id; is_init 微信分享init(true,父元素自己初始化，false或不传值,混合统一处理)
  async init(page_id,activity_id,is_init){
    // 获取用户信息
    this.user_info = await get_user_base_info(this.user_id,page_id,this.pid)
    this.page_id = page_id
    if(this.user_info){
      this.user_id = this.user_info.uid
    }else{
      // sa 埋点
      sa.quick('autoTrack',{
        page_id,
        environment:this.environment,
        channel_type:this.channel,
        url:window.location.href,
        referrer:document.referrer
      })
    }
    if(activity_id){
      // 获取活动配置
      const [err,data] = await awaitWrap(get_page_config(activity_id))
      if(data){
        this.page_img = data
        // 分享初始化
        if(is_init){
          // 父级自己初始化
        }else{
          // 混合统一处理
          this.initShare(this.page_img.share_title,this.page_img.share_content,this.page_img.share_logo)
        }
      }else{
        toast(err)
      }
    }
  }
  handleLoginSuc(user_info){
    this.showLogin = false
    let searchParams = new URLSearchParams(window.location.search)
    searchParams.delete("code")
    searchParams.delete("state")
    searchParams.delete("v")
    searchParams.delete("user_id")
    searchParams.append("user_id", user_info.uid)
    window.location.replace(
      `${
        window.location.href.split("?")[0]
      }?v=reload&${searchParams.toString()}`
    );
  }
  handleShare(){
    sharewx(this.shareOptions)
    // sa
    sa.track('share_way_click',{
      share_way:'',
    })
  }
  initShare(share_title,share_content,share_logo,share_url){
    // 如果分享标题或者描述传空，则隐藏分享功能
    if(!share_title || !share_content){
      if(this.environment==='wx'){
        // 微信分享初始化
        const shareOptions = {
          title: '',
          content: '',
          url: '',
          logo: '',
          menuList: ["menuItem:share:appMessage", "menuItem:share:timeline", "menuItem:copyUrl"]
        }
        share_init(shareOptions)
      }
      return false
    }
    const shareType = this.environment==='wx'?'rtshare':'appshare'
    const share_channel_id = this.channel_id + 1
    const default_url = `${window.location.href.split('?')[0]}?channel=${shareType}&ambass_id=${this.user_id}&channel_id=${share_channel_id}`
    let url = default_url
    if(share_url){
      url = share_url.indexOf('?')>-1?`${share_url}&channel=${shareType}&ambass_id=${this.user_id}&channel_id=${share_channel_id}`:`${share_url}?channel=${shareType}&ambass_id=${this.user_id}&channel_id=${share_channel_id}`
    }
    this.shareOptions = {
      title: share_title,
      content: share_content,
      url,
      logo:share_logo || 'https://yxs-app.oss-cn-beijing.aliyuncs.com/7afea67a09b7b83b2c8ab219d2bd8b10'
    }
    if(this.environment==='wx'){
      // 微信分享初始化
      share_init(this.shareOptions).then(res=>{
        // sa
        if(res==='wx'){
          // 微信
          sa.track('share_wx',{
            share_way:'wechat',
            page_id:this.page_id
          })
        }else{
          // 朋友圈
          sa.track('share_wx',{
            share_way:'post',
            page_id:this.page_id
          })
        }
      })
    }
  }
}