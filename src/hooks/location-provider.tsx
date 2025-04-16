import { createContext, JSX, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useGeolocation } from 'react-use'
import { GeoLocationSensorState, IGeolocationPositionError } from 'react-use/lib/useGeolocation'
import { GeoApiDataType, geoLookupApi } from '@/lib/api.ts'

interface LocationType {
  location: GeoLocationSensorState
  loading: boolean
  error?: Error | IGeolocationPositionError
  updateLocation: (location: GeoLocationSensorState, currentCity: string, currentProvince: string) => void
  updateLocationWeather: (temp: number, weatherText: string, updateCity: string, updateProvince: string) => void
  province: string
  city: string
  temp: number
  weatherText: string
}

const LOCATION_STORAGE_KEY = 'user_location'

const LocationContext = createContext({} as LocationType)

export const LocationProvider = ({ children }: { children: JSX.Element }) => {
  const getStoredLocation = useCallback(() => {
    const stored = localStorage.getItem(LOCATION_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  }, [])

  const [location, setLocation] = useState(getStoredLocation)
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  const [temp, setTemp] = useState(0)
  const [weatherText, setWeatherText] = useState('')

  const baseGeoState = useGeolocation({
    timeout: 5000,
    enableHighAccuracy: true
  })

  // useRef 来存储上一次由 baseGeoState 成功处理的位置
  const lastProcessedGeoLocationRef = useRef({})

  // --- Effect 1: Sync from Live Geolocation to State/LocalStorage ---
  useEffect(() => {
    const { latitude, longitude, loading, error, ...rest } = baseGeoState
    if (!loading && !error && latitude !== null) {
      const currentLiveLocation = { latitude, longitude, ...rest }

      if (JSON.stringify(currentLiveLocation) !== JSON.stringify(lastProcessedGeoLocationRef)) {
        console.log(`Location updated: ${JSON.stringify(currentLiveLocation)}`)
        // 更新 Ref，表示我们已经处理了这个新的实时位置
        lastProcessedGeoLocationRef.current = currentLiveLocation

        const storedLocation = getStoredLocation()
        if (JSON.stringify(currentLiveLocation) !== JSON.stringify(storedLocation)) {
          try {
            localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(currentLiveLocation))
            setLocation(currentLiveLocation)
          } catch (e) {
            console.error('Error saving location to localStorage:', e)
          }
        }
      } else {
        console.log("Context: Live location hasn't changed since last processing. No update triggered by geo hook.")
      }
    }
  }, [baseGeoState, getStoredLocation])

  // --- Effect 2: Sync from Storage Event to State ---
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LOCATION_STORAGE_KEY) {
        console.log('Context: Storage event detected')
        try {
          const newValue = event.newValue ? JSON.parse(event.newValue) : null
          if (JSON.stringify(newValue) !== JSON.stringify(location)) {
            console.log(`Location updated from storage: ${JSON.stringify(newValue)}`)
            setLocation(newValue)
          }
        } catch (e) {
          console.error('Error parsing location from localStorage:', e)
          setLocation(null)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [location]) // 依赖 location

  // --- Function: Manual Update ---
  const updateLocation = useCallback(
    (newLocation: GeoLocationSensorState, currentCity: string, currentProvince: string) => {
      console.log(`Context: Manual updateLocation called: ${JSON.stringify(newLocation)}`)

      try {
        const newLocationString = JSON.stringify(newLocation)
        if (newLocationString !== JSON.stringify(location)) {
          localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLocation))
          setLocation(newLocation)
          setCity(currentCity)
          setProvince(currentProvince)
          lastProcessedGeoLocationRef.current = newLocation
        }
      } catch (e) {
        console.error('Context: Error writing location on manual update:', e)
      }
    },
    [location]
  )

  const updateLocationWeather = useCallback(
    (temp: number, weatherText: string, updateCity: string, updateProvince: string) => {
      console.log(`Context: Manual updateLocationWeather called: ${JSON.stringify(temp)}`)
      if (updateCity === city && updateProvince === province) {
        setTemp(temp)
        setWeatherText(weatherText)
      }
    },
    [location]
  )

  // const updateCurrentLocationInfo

  useEffect(() => {
    if (location && location.latitude !== null && location.longitude !== null) {
      const call = async (lat: string, lon: string) => {
        const response = await geoLookupApi(`${lon},${lat}`)
        const { code, data }: { data: GeoApiDataType[]; code: number } = response
        if (code === 200 && data.length > 0) {
          setProvince(data[0].adm1)
          setCity(data[0].name)
        }
      }
      call(location.latitude, location.longitude)
    }
  }, [location])

  const value: LocationType = {
    location, // 同步后的位置
    loading: baseGeoState.loading,
    error: baseGeoState.error,
    updateLocation, // 提供更新函数
    updateLocationWeather,
    province,
    city,
    temp,
    weatherText
  }

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
}

export const useLocationContext = () => {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider')
  }
  return context
}
