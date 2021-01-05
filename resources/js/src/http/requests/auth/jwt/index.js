import axios from '../../../axios/index.js'
import store from '../../../../store/store.js'
import router from '@/router'

// Token Refresh
let isAlreadyFetchingAccessToken = false
let subscribers = []

function onAccessTokenFetched (access_token) {
    subscribers = subscribers.filter(callback => callback(access_token))
}

function addSubscriber (callback) {
    subscribers.push(callback)
}

export default {
    init () {
        axios.interceptors.response.use(function (response) {
            return response
        }, function (error) {
            // const { config, response: { status } } = error
            const { config, response } = error
            const originalRequest = config

            // if (status === 401) {
            if (response && response.status === 401) {
                if (!isAlreadyFetchingAccessToken) {
                    isAlreadyFetchingAccessToken = true
                    store.dispatch('auth/fetchAccessToken')
                        .then((response) => {
                            isAlreadyFetchingAccessToken = false
                            onAccessTokenFetched(response.data.data.token)
                            sessionStorage.removeItem('accessToken')
                            sessionStorage.setItem('accessToken', response.data.data.token)
                        })
                } else {
                    sessionStorage.removeItem('accessToken')
                    window.location.reload()
                    // router.push({name: 'user-list'})
                    // router.pushAsync = function (route) {
                    //   return new Promise((resolve, reject) => {
                    //     router.push(route, resolve, reject);
                    //   });
                    // };
                }

                const retryOriginalRequest = new Promise((resolve) => {
                    addSubscriber(access_token => {
                        // Make sure to assign access_token according to your response.
                        // Check: https://pixinvent.ticksy.com/ticket/2413870
                        originalRequest.headers.Authorization = `Bearer ${access_token}`
                        resolve(axios(originalRequest))
                    })
                })
                return retryOriginalRequest
            }
            return Promise.reject(error)
        })
    },
    login (email, pwd) {
        return axios.post('/api/login', {
            email,
            password: pwd
        })
    },
    registerUser (name, email, pwd) {
        return axios.post('/api/register', {
            displayName: name,
            email,
            password: pwd
        })
    },
    refreshToken () {
        return axios.post('/api/refresh', {refresh_token: sessionStorage.getItem('accessToken')})
    }
}
