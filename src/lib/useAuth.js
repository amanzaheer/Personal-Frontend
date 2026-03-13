import { useState, useEffect } from 'react'

// Safe JSON parsing helper function
const safeJsonParse = (item, fallback = null) => {
  try {
    const data = localStorage.getItem(item)
    if (!data || data === 'undefined' || data === 'null') {
      return fallback
    }
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error parsing ${item} from localStorage:`, error)
    localStorage.removeItem(item)
    return fallback
  }
}

const useAuth = () => {
  const [user, setUser] = useState(() => {
    return safeJsonParse('user', null)
  })

  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem('accessToken') || null
  })

  const [refreshToken, setRefreshToken] = useState(() => {
    return localStorage.getItem('refreshToken') || null
  })

  const [menu_permissions, setMenuPermissions] = useState(() => {
    return safeJsonParse('menu_permissions', null)
  })

  const [merchant, setMerchant] = useState(() => {
    return localStorage.getItem('merchant') || null
  })

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user))
    if (accessToken) localStorage.setItem('accessToken', accessToken)
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
    if (menu_permissions) localStorage.setItem('menu_permissions', JSON.stringify(menu_permissions))
  }, [user, accessToken, refreshToken, menu_permissions])

  const loginUser = (userInfo, tokens, menu_permissions) => {
    setUser(userInfo)
    if (tokens) {
      const { accessToken, refreshToken } = tokens
      setAccessToken(accessToken)
      setRefreshToken(refreshToken)
    }
    setMenuPermissions(menu_permissions)
  }

  const logoutUser = () => {
    setUser(null)
    setAccessToken(null)
    setRefreshToken(null)
    setMenuPermissions(null)
    setMerchant(null)
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('menu_permissions')
    localStorage.removeItem('merchant')
    localStorage.removeItem('previousAccessToken')
    localStorage.removeItem('previousRefreshToken')
    localStorage.removeItem('customOrigin')
    localStorage.removeItem('merchants')
    localStorage.removeItem('activeSwitch')
    localStorage.removeItem('membershipPopupLastShown')
    localStorage.removeItem('popupShown')
    // Redirect to login instead of reloading
    if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
      window.location.href = '/login'
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
    loginUser,
    logoutUser,
    menu_permissions,
    merchant,
  }
}

export default useAuth
