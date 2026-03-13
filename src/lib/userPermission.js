
import { useState, useEffect } from 'react'

const usePermissions = () => {
  const [permissions, setPermissions] = useState([])

  useEffect(() => {
    // Function to fetch permissions from localStorage
    const fetchPermissions = () => {
      const menu_permission =JSON.parse(localStorage.getItem('user'))
      const storedPermissions = menu_permission?.roleId?.permissions
      console.log("storedPermissions", storedPermissions);
      
      if (storedPermissions) {
        setPermissions(
          storedPermissions?.map((permission) =>
            permission?.toLowerCase()
          )
        )
      } else {
        setPermissions([])
      }
    }

    // Initial fetch
    fetchPermissions()

    // Set interval to fetch every 5 minutes
    const intervalId = setInterval(fetchPermissions, 10000)

    // Cleanup on unmount
    return () => clearInterval(intervalId)
  }, [])

  const hasPermission = (item) => {
    const userStr = localStorage.getItem('user')
    let user = null
    try {
      user = userStr ? JSON.parse(userStr) : null
    } catch {}
    const isAdmin = user?.role === 'admin'
    if (isAdmin) return true
    if (typeof item === 'string') {
      return permissions?.includes(item?.toLowerCase())
    }
    return false
  }

  return { hasPermission }
}

export default usePermissions
