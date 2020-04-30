<template>
  <main>
    <p class="tips">
      请填写下方表格，
      <br />提交成功后，会钉钉通知大家。
    </p>
    <div class="form">
      <div class="form-item">
        <input class="input" v-model="form.amount" type="tel" placeholder="消费金额" />
      </div>
      
      <div class="form-item">
        <input class="input" v-model="form.desc" type="text" placeholder="请输入描述、用途" />
      </div>
      <div class="form-item">
        <select class="select" v-model="form.user_id" name="" id="">
          <option value="" disabled selected>请选择...</option>
          <option v-for="user in user_list" :value="user.id" :key="user.id">{{user.name}}</option>
        </select>
      </div>
    </div>
    
    <div class="btn" @click="handleClick">立即提交</div>
  </main>
</template>

<script>
import Component, { mixins } from "vue-class-component";
import indexMixin from "../mixins/index.js";
import { get_common, enroll } from "../utils/api";
import { toast } from "hd-sdk-dev";
const page_id = "reserve-index";

@Component({
  components: {}
})
export default class Main extends mixins(indexMixin) {
  showTips = false;
  user_list = []
  form = {
    desc: "",
    amount: "",
    user_id: ""
  };
  async handleClick() {
    if (!this.form.amount) return toast("请填写消费金额");
    if (!this.form.desc) return toast("请填写描述");
    if (!this.form.user_id) return toast("请选择用户");
    let params = {
      ...this.form
    };
    try {
      document.querySelector(".hd-mask").classList.add("isLoading");
      let res = await enroll(params);
      toast('提交成功')
    } catch (e) {
      toast(e);
    }finally {
      document.querySelector(".hd-mask").classList.remove("isLoading");
    }
  }
  async mounted() {
    try {
      let res = await get_common()
      this.user_list = res.users
      var originalHeight =
        document.documentElement.clientHeight || document.body.clientHeight;
      window.onresize = function() {
        var resizeHeight =
          document.documentElement.clientHeight || document.body.clientHeight;
        if (resizeHeight - 0 < originalHeight - 0) {
          console.log("键盘弹起");
        } else {
          console.log("收起");
        }
      };
    } catch (e) {
      console && console.log(e);
    }
    document.body.addEventListener("focusin", () => {
      //软键盘弹起事件
    });
    document.body.addEventListener("focusout", () => {
      //软键盘关闭事件
      window.scroll(0, 0); //失焦后强制让页面归位
    });
    // hide loading mask
    document.querySelector(".hd-mask").classList.remove("isLoading");
  }
}
</script>

<style>
@import "./style.scss";
</style>
