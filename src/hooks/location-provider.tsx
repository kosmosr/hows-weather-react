import { createContext, JSX, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { GeoLocationSensorState, IGeolocationPositionError } from 'react-use/lib/useGeolocation'
import { GeoApiDataType, geoLookupApi } from '@/lib/api.ts'
import { useGeolocation } from 'react-use'
import { roundCoordinate } from '@/lib/utils.ts'

interface LocationType {
  location: GeoLocationSensorState
  error?: Error | IGeolocationPositionError
  updateLocation: (location: GeoLocationSensorState) => void
  updateLocationWeather: (temp: number, weatherText: string, lat?: number, lon?: number) => void
  baseLocationInfo: CurrentLocationInfoType
  currentLocationInfo: CurrentLocationInfoType
}

interface CurrentLocationInfoType {
  name?: string // 城市名称
  province?: string // 省
  latitude: number // 纬度
  longitude: number // 经度
  temp?: number // 温度
  weatherText?: string // 天气状况
}

// 存储了用户的位置 可以修改
const LOCATION_STORAGE_KEY = 'user_location'

const LocationContext = createContext({} as LocationType)

const getStoredLocation = () => {
  const stored = localStorage.getItem(LOCATION_STORAGE_KEY)
  return stored ? JSON.parse(stored) : null
}

export const LocationProvider = ({ children }: { children: JSX.Element }) => {
  const [location, setLocation] = useState(getStoredLocation)
  const [baseLocationInfo, setBaseLocationInfo] = useState<CurrentLocationInfoType>({
    latitude: 0,
    longitude: 0
  })
  const [currentLocationInfo, setCurrentLocationInfo] = useState<CurrentLocationInfoType>({
    latitude: 0,
    longitude: 0
  })
  // 当前是否手动选择了城市信息
  const [isManualLocationSelected, setIsManualLocationSelected] = useState(false)
  const baseGeoState = useGeolocation()

  // useRef 来存储上一次由 baseGeoState 成功处理的位置
  const lastProcessedGeoLocationRef = useRef({})

  // --- Effect 1: Sync from Live Geolocation to State/LocalStorage ---
  useEffect(() => {
    const { latitude, longitude, loading, ...rest } = baseGeoState
    if (!loading && latitude !== null && longitude != null && !isManualLocationSelected) {
      const currentLiveLocation = {
        latitude: roundCoordinate(latitude),
        longitude: roundCoordinate(longitude),
        loading,
        ...rest
      }

      if (JSON.stringify(currentLiveLocation) !== JSON.stringify(lastProcessedGeoLocationRef)) {
        console.log(`Location updated: ${JSON.stringify(currentLiveLocation)}`)
        // 更新 Ref，表示我们已经处理了这个新的实时位置
        lastProcessedGeoLocationRef.current = currentLiveLocation

        const storedLocation: GeoLocationSensorState = getStoredLocation()
        if (
          storedLocation &&
          !(storedLocation.latitude == currentLiveLocation.latitude && storedLocation.longitude == currentLiveLocation.longitude)) {
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
  }, [baseGeoState])

  // --- Function: Manual Update ---
  const updateLocation = useCallback(
    (newLocation: GeoLocationSensorState) => {
      console.log(`Context: Manual updateLocation called: ${JSON.stringify(newLocation)}`)
      const rawLocation = {
        lat: roundCoordinate(location.latitude),
        lon: roundCoordinate(location.longitude)
      }

      try {
        if (!(newLocation.longitude === rawLocation.lon && newLocation.latitude === rawLocation.lat)) {
          localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLocation))
          setLocation(newLocation)
          lastProcessedGeoLocationRef.current = newLocation
          // 设置手动选择标志
          setIsManualLocationSelected(true)
        }
      } catch (e) {
        console.error('Context: Error writing location on manual update:', e)
      }
    },
    [location]
  )

  const updateLocationWeather = useCallback(
    (temp: number, weatherText: string, lat?: number, lon?: number) => {
      console.log(`Context: Manual updateLocationWeather called`)
      if (lat === currentLocationInfo.latitude && lon === currentLocationInfo.longitude) {
        console.log(`Context: updateLocationWeather: ${JSON.stringify(currentLocationInfo)}`)
        setCurrentLocationInfo({
          ...currentLocationInfo,
          temp,
          weatherText
        })
        if (baseLocationInfo.longitude === 0 && baseLocationInfo.latitude === 0) {
          //
          console.log(`Context: updateBaseLocationInfo: ${JSON.stringify(currentLocationInfo)}`)
          setBaseLocationInfo({
            ...currentLocationInfo,
            temp,
            weatherText
          })
        }
      }
    },
    [currentLocationInfo]
  )

  useEffect(() => {
    if (location && location.latitude !== null && location.longitude !== null) {
      const call = async () => {
        const response = await geoLookupApi(`${roundCoordinate(location.longitude)},${roundCoordinate(location.latitude)}`)
        const { code, data }: { data: GeoApiDataType[]; code: number } = response
        if (code === 200 && data.length > 0) {
          setCurrentLocationInfo({
            latitude: roundCoordinate(location.latitude),
            longitude: roundCoordinate(location.longitude),
            name: data[0].name,
            province: data[0].adm1
          })
        }
      }
      call()
    }
  }, [location])

  const value: LocationType = {
    location, // 同步后的位置
    currentLocationInfo, // 当前位置信息
    baseLocationInfo, // 基础位置信息
    updateLocation, // 提供更新函数
    updateLocationWeather
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
