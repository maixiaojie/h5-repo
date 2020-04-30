const path = require('path')
const fs = require('fs')

const baseUrl = path.resolve(__dirname, '../src')
const pageName = process.argv[2]

if (!pageName) {
	console.log(`pagename不能为空`);
	console.log('示例： npm run page <pagename>')
	process.exit(0)
}

const appVueTemplate =
`<template>
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

const page_id = '${pageName}-index'

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
`

const indexJsTemplate =
`import Vue from 'vue'
import App from './app.vue'

import '$style/loading.pcss'
import '$style/reset.pcss'

new Vue({
  components: { App },
  render (h) {
    return (
      <App/>
    )
  }
}).$mount('#app')
`

const styleScssTemplate =
``

const htmlTemplate =
`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no"/>
  <title>混沌大学</title>
  <script>
    (document.getElementsByTagName('html')[0].style.fontSize = (document.documentElement.clientWidth ||  document.body.clientWidth) / 23.4375 + 'px')
  </script>
</head>
<body>
  <div class="hd-mask isLoading">
    <div class="lds-css ng-scope">
      <div style="width:100%;height:100%" class="lds-rolling">
        <div></div>
      </div>
    </div>
  </div>
  <div id="app"></div>
  <!-- <script src="//yxs-web.oss-cn-beijing.aliyuncs.com/js/vconsole.min.js"></script>
  <script>
    new VConsole()
  </script> -->
  <script src="//yxs-web.oss-cn-beijing.aliyuncs.com/js/jweixin/1.4.0/jweixin.min.js"></script>
  <script src="//yxs-web.oss-cn-beijing.aliyuncs.com/js/raven.js/3.19.1/raven.min.js"></script>
  <script src="//yxs-web.oss-cn-beijing.aliyuncs.com/js/polyfill/7.0.0/polyfill.min.js"></script>
  <script src="//yxs-web.oss-cn-beijing.aliyuncs.com/js/vue/2.5.17/runtime/vue.min.js"></script>
  <script src="//yxs-web.oss-cn-beijing.aliyuncs.com/js/axios/0.18.0/axios.min.js"></script>
  <script src="./${pageName}/index.js"></script>
</body>
</html>
`

const viewPath = `${baseUrl}/${pageName}`

if (!fs.existsSync(viewPath)) {
	fs.mkdirSync(viewPath)
}

const create = () => {
	process.chdir(baseUrl)
	fs.writeFileSync(`${pageName}.html`, htmlTemplate)
	process.chdir(viewPath)
	fs.writeFileSync('app.vue', appVueTemplate)
	fs.writeFileSync('index.js', indexJsTemplate)
	fs.writeFileSync('style.scss', styleScssTemplate)
}

create()
process.exit(0)