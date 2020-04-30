import Vue from 'vue'
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
