<template>
  <div class="login-dialog">
    <div class="login-wrap" @click="handleStopClose($event)">
      <div class="title">手机号登录</div>
      <div class="phone-wrap">
        <div class="phone-l">
          <div id="show" class="show">{{c_code}}</div>
          <select id="country-list" v-model="c_code">
            <option v-for="(item,key) in country_list" :key="key" :value="item.country_code">{{item.country_name+' '+item.country_code}}</option>
          </select>
        </div>
        <div class="phone-r">
          <input @focus="handleBlur" @blur="handleBlur" placeholder="请输入手机号" type="tel" name="" id="phone" v-model="phone">
        </div>
      </div>
      <div class="code-wrap">
        <input @focus="handleBlur" @blur="handleBlur" placeholder="请输入验证码" type="tel" id="code" v-model="code" />
        <span></span>
        <button @click="get_code(0)" v-if="!yy_show" class="right" id="code-desc">获取验证码</button>
        <p v-if="yy_show" id="yuyin">{{time}}s<span @click="handleShowYY">未收到?</span></p>
      </div>
      <div @click="bind_phone" class="login-btn" id="login">{{'确认'}}</div>
      <div @click="handleClose" class="close-icon"></div>
    </div>
  </div>
</template>
<script>
import { Vue, Component, Prop } from 'vue-property-decorator'
import { is_weixin,toast ,dialog,getBaseEnvironment,query} from 'hd-sdk-dev';
const open_id = window.localStorage.getItem('openid')
const envi = getBaseEnvironment();
const channel = 'yxs1909'
const pid = query('pid') || ''
const channel_id = parseInt(query('channel_id') || process.env.CHANNEL_ID)
const plat_type = 'h5_h5_h5'
let wxpub_id = 2
if(window.location.host.indexOf('activity.hundun.com.cn')>-1){
  wxpub_id = 3
}else if(window.location.host.indexOf('tools.hundun.cn') > -1 || window.location.host.indexOf('share.hundun.cn') > -1){
  wxpub_id = 1
}
@Component
export default class List extends Vue {
  @Prop(Object) user_info
  user_id = ''
  country_list=[]
  time=60
  yy_show=false
  c_code='+86'
  code=''
  phone=''
  mounted() {
    this.user_id = this.user_info ? this.user_info.uid : ''
    this.get_country();
  }
  handleStopClose(e){
    e.stopPropagation();
    return false;
  }
  handleBlur(){
    document.body.scrollIntoView();
  }
  handleShowYY(){
    dialog.showdialog({
      title: "语音验证码",
      content: "若您长时间未能收到验证码短信，可通过电话方式获取，请注意接听来电。",
      confirmbtn: "现在接听",
      onconfirm: () => {
        this.get_code(1);
      },
      oncancel: () => {
        console.log('cancel')
      }
    })
  }
  get_code(isvoice){
    if (this.c_code != '+86') {
      this.phone = '00' + this.c_code.substring(1) + this.phone;
    }
    if (!this.phone) {
      toast('请输入手机号');
      return false;
    }
    return new Promise((resolve, reject) => {
      return axios.get(process.env.USER_HOST + '/get_identify_code', {
        params:{
          phone: this.phone,
          isvoice: isvoice,
          type: 'bind_phone',
          clientType: 'h5',
          channel
        }
      }).then((res) => {
        let data = res.data;
        if (data.error_no == 0) {
          this.yy_show=true;
          let timer = setInterval(()=> {
            this.time--;
            if (this.time == 0) {
              this.time = 60;
              this.yy_show=false;
              clearInterval(timer);
            }
          }, 1000)
        } else {
          toast(data.error_msg);
        }
      }).catch(err => {
        reject(err);
      })
    })
  }
  bind_phone(){
    if (this.c_code != '+86') {
      this.phone = '00' + this.c_code.substring(1) + this.phone;
    }
    if (!this.phone) {
      toast('请输入手机号');
      return false;
    }
    if(this.user_info.phone === this.phone){
      this.$emit('on-login-suc',this.user_info)
      return false
    }
    if (!this.code) {
      toast('请输入验证码');
      return false;
    }
    if(envi == 'wx'){
      return new Promise((resolve, reject) => {
        return axios.post(process.env.USER_HOST + '/bind_phone', JSON.stringify({
          uid: this.user_id,
          phone: this.phone,
          identify_code: this.code,
          user_name: '',
          type: 'h5wx',
          openid: open_id,
          clientType: 'h5',
          channel,
          pid,
          plat_type,
          channel_id,
          wxpub_id
        })).then(res => {
          if (res.data.error_no == 0) {
            let user_info = res.data.data;
            this.$emit('on-login-suc',user_info);
          } else {
            toast(res.data.error_msg);
            reject(res.data.error_msg);
          }
        }).catch(err => {
          reject(Raven.captureMessage(err));
          toast('网络繁忙');
        })
      })
    }else{
      // 第三方平台
      return new Promise((resolve, reject) => {
        return axios.post(process.env.USER_HOST + '/identify_code_login', JSON.stringify({
          phone: this.phone,
          identify_code: this.code,
          clientType: 'h5',
          channel,
          channel_id,
          pid,
          plat_type
        })).then(res => {
          if (res.data.error_no == 0) {
            let user_info = res.data.data;
            this.$emit('on-login-suc',user_info);
          } else {
            toast(res.data.error_msg);
            reject(res.data.error_msg);
          }
        }).catch(err => {
          toast('网络繁忙');
          reject(Raven.captureMessage(err));
        })
      })
    }
  }
  handleClose(){
    this.$emit('on-close',null);
  }
  get_country(){
    return axios.get(process.env.USER_HOST + '/app/user_country_list?clientType=h5').then(res => {
      let country_list = res.data.data.country_list;
      this.country_list = country_list;
    }).catch(err => {
      console.log('网络错误')
    })
  }
}
</script>

<style>@import "./login.scss";</style>