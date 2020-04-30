<template>
  <main>
    <!-- APP 环境分享按钮 -->
    <template v-if="environment === 'app'">
      <div class="hd-share" @click="handleShare"></div>
    </template>
    <!-- 微信分享提示 -->
    <div class="hd-shareTip" :class="{isShow: showTips}" @click="showTips = false"></div>
    <!-- 登陆弹窗 -->
    <!-- 组件成功回调混合已经处理，无需任何处理，特殊情况自己定义回调函数名 -->
    <Login v-if="showLogin" @on-login-suc="handleLoginSuc" @on-close="showLogin = false" :user_info="user_info"></Login>
  </main>
</template>

<script>
import Component, { mixins } from 'vue-class-component'
import indexMixin from '../mixins/index.js'
import Login from '../components/login';
const page_id = 'cxxly-index'
@Component({
  components:{Login}
})
export default class Main extends mixins(indexMixin) {
  showTips = false
  async mounted() {
    // 获取用户信息(init方法参数说明见 混合 mixins/index)成功后添加埋点
    await this.init(page_id)
    // hide loading mask
    document.querySelector(".hd-mask").classList.remove("isLoading")
  }
}
</script>

<style>@import "./style.scss";</style>