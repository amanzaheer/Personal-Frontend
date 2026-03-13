import { useState } from 'react'
import axios from 'axios'
import useAuth from './useAuth'

// Enhanced API hook that combines both api.js and useApi.js functionality
const useApi = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { logoutUser } = useAuth()
  const baseURL = import.meta.env.VITE_API_BASE_URL
  const customOrigin = import.meta.env.VITE_ORIGIN

  const getHeaders = () => {
    const token = localStorage.getItem('auth_token')
    return {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Custom-Origin': customOrigin,
      Origin: baseURL,
      'Cache-Control': 'no-cache',
    }
  }

  const getFormHeaders = () => {
    const h = getHeaders()
    const { 'Content-Type': _, ...rest } = h
    return rest
  }

  const getRefreshToken = () => localStorage.getItem('refreshToken')

  const request = async ({
    method,
    url,
    data = {},
    params = {},
    attemptRefresh = true,
    headers = {},
  }) => {
    setIsLoading(true)
    setError(null)

    try {
      // Remove /api prefix if it's already in the baseURL
      const apiUrl = baseURL.endsWith('/api') ? `${baseURL}/${url}` : `${baseURL}/api/${url}`

      const isFormData = data && typeof FormData !== 'undefined' && data instanceof FormData
      const reqHeaders = isFormData ? { ...getFormHeaders(), ...headers } : { ...getHeaders(), ...headers }

      const response = await axios({
        method,
        url: apiUrl,
        headers: reqHeaders,
        data,
        params,
        withCredentials: true,
      })

      return response
    } catch (err) {
      // Handle 401/403 errors with token refresh
      if (
        err.response &&
        (err.response.status === 401) &&
        attemptRefresh
      ) {
        const refreshToken = getRefreshToken()

        if (!refreshToken) {
          console.warn('No refresh token available, logging out user')
          logoutUser()
          window.location.href = '/login'
          return
        }

        try {
          // Construct the refresh token URL properly
          const refreshBaseURL = baseURL.endsWith('/api') ? baseURL.slice(0, -4) : baseURL

          const refreshResponse = await axios.post(
            `${refreshBaseURL}/api/auth/refreshToken`,
            { refreshToken },
            {
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'Custom-Origin': customOrigin,
              },
              withCredentials: true,
            }
          )

          // Extract tokens from response - handle both possible response structures
          const responseData = refreshResponse.data
          const newAccessToken = responseData.data?.accessToken || responseData.accessToken
          const newRefreshToken = responseData.data?.refreshToken || responseData.refreshToken

          if (!newAccessToken) {
            console.error('No access token in refresh response:', responseData)
            throw new Error('Invalid refresh token response structure')
          }

          // Update tokens in localStorage (update both auth_token and accessToken for compatibility)
          localStorage.setItem('auth_token', newAccessToken)
          localStorage.setItem('accessToken', newAccessToken)
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken)
          }

          // Retry the original request with the new token
          return request({ method, url, data, params, attemptRefresh: false, headers })
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)

          // If refresh fails with 401, the refresh token is invalid
          if (refreshError?.response?.status === 401) {
            console.warn('Refresh token is invalid, logging out user')
            // Clear all tokens before logout
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user')
            localStorage.removeItem('menu_permissions')
            localStorage.removeItem('customOrigin')
            localStorage.removeItem('activeSwitch')

            logoutUser()
            window.location.href = '/login'
            return
          }

          // For other refresh errors, throw the original error
          setError(refreshError?.response?.data?.message || 'Token refresh failed')
          throw refreshError
        }
      } else {
        // For non-auth errors or when refresh is disabled
        const errorMessage = err?.response?.data?.message || 'An error occurred'
        setError(errorMessage)
        console.error('API request failed:', errorMessage, err)
        throw err
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Helper methods for common HTTP verbs
  const get = (url, params = {}, headers = {}) => request({ method: 'GET', url, params, headers })

  const post = (url, data = {}, headers = {}) => request({ method: 'POST', url, data, headers })

  const put = (url, data = {}, headers = {}) => request({ method: 'PUT', url, data, headers })

  const postForm = (url, formData, headers = {}) =>
    request({ method: 'POST', url, data: formData, headers: { ...getFormHeaders(), ...headers } })
  const putForm = (url, formData, headers = {}) =>
    request({ method: 'PUT', url, data: formData, headers: { ...getFormHeaders(), ...headers } })

  const patch = (url, data = {}, headers = {}) => request({ method: 'PATCH', url, data, headers })

  const del = (url, headers = {}) => request({ method: 'DELETE', url, headers })

  // Additional utility methods
  const clearTokens = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('menu_permissions')
  }

  const isTokenExpired = (token) => {
    if (!token) return true

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      return payload.exp < currentTime
    } catch (error) {
      console.error('Error parsing token:', error)
      return true
    }
  }

  const getAccessToken = () => localStorage.getItem('auth_token')

  return {
    isLoading,
    error,
    request,
    get,
    post,
    put,
    postForm,
    putForm,
    patch,
    delete: del,
    clearTokens,
    isTokenExpired,
    getAccessToken,
    getRefreshToken,
  }
}

export default useApi
