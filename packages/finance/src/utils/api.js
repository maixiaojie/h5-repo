import axios from 'axios'
import { query } from 'hd-sdk-dev'
axios.defaults.timeout = 10000
const os = navigator.userAgent.match(/Android/i)?'Android':'iOS';
const pid = query('pid') || ''
export const get_page_config = (activity_key) => {
  return new Promise((resolve, reject) => {
    let c_host = process.env.COURSE_HOST;
    return axios.get(`${c_host}/activity/get_config`, {
      params: {
        activity_key
      }
    }).then(res => {
      if (res.data.error_no == 0) {
        resolve(res.data.data);
      } else {
        reject(res.data.error_msg);
      }
    }).catch(err => {
      reject('网络繁忙, 请稍后重试');
    })
  })
}
export const get_common = () => {
  return new Promise((resolve, reject) => {
    let c_host = process.env.API_HOST;
    return axios.get(`${c_host}`, {
    }).then(res => {
      if (res.data.code == 1) {
        resolve(res.data.data);
      } else {
        reject(res.data.msg);
      }
    }).catch(err => {
      reject('网络繁忙, 请稍后重试');
    })
  })
}
export const enroll = (data) => {
  return new Promise((resolve, reject) => {
    let c_host = process.env.API_HOST;
    return axios.post(`${c_host}/order/add`, 
      data
    ).then(res => {
      if (res.data.code == 1) {
        resolve(res.data.data);
      } else {
        reject(res.data.msg);
      }
    }).catch(err => {
      reject('网络繁忙, 请稍后重试');
    })
  })
}
/**
 * 处理async await 异常
 * @param {*} promise
 */
export const awaitWrap = promise => {
  return promise
      .then(data => [null, data])
      .catch(err => [err, null])
}