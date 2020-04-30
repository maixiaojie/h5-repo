
const Toasted = require('vue-toasted').default

Vue.use(Toasted, {
  position: 'top-center',
  duration: 5000,
  className: 'hd-toasted',
  singleton: true
})

module.exports = Vue