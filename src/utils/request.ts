import axios, {
  InternalAxiosRequestConfig,
  AxiosError,
  AxiosResponse,
  AxiosRequestConfig,
} from 'axios'
import { ElMessage } from 'element-plus'

interface responseError<T = any> extends Error {
  config: AxiosRequestConfig
  code?: string
  request?: any
  response: Myresponse<T>
  isAxiosError: boolean
  toJSON: () => object
}
interface Myresponse<T = any> {
  data: T
  code: string
  statusText: string
  headers: any
  config: AxiosRequestConfig
  request?: any
}

//请求拦截器
axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token: string | null = localStorage.getItem('tokenStr')
    if (token) {
      config.headers['Authorization'] =
        window.sessionStorage.getItem('tokenStr')
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)
//响应拦截器
axios.interceptors.response.use(
  (success: AxiosResponse) => {
    if (success.status && success.status === 200) {
      let code = success.data.code
      if (code != 0) {
        ElMessage.error(success.data.msg)
        debugger
        if (code === 1 || code === 51) {
          //清除用户信息
          window.sessionStorage.removeItem('user')
          window.sessionStorage.removeItem('tokenStr')
          /* //清空菜单
            this.$store.commit('initRoutes', [])
            //跳转登录页
            this.$router.replace("/") */
        }
        return
      }
      if (success.data.message) {
        ElMessage({
          message: success.data.message,
          type: 'success',
        })
      }
    }
    return success.data
  },
  (error: responseError) => {
    switch (error.response.code) {
      case '504':
        ElMessage.error('网络连接失败，请检查网络')
        break
      case '404':
        ElMessage.error('网络连接失败，请检查网络')
        break
      case '403':
        ElMessage.error('您的权限不足，请联系管理员')
        break
      case '401':
        ElMessage.error('尚未登陆，请登录！')
        break
      default:
        ElMessage.error('服务器异常，请稍后再试')
        break
    }
  }
)
