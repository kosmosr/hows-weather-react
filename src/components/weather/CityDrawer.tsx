import { ChangeEvent, JSX, useRef, useState } from 'react'
import { Clock, HousePlus, MapPin, Navigation, Search, X } from 'lucide-react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLocationContext } from '@/hooks/location-provider.tsx'
import { GeoApiDataType, geoLookupApi } from '@/lib/api.ts'
import WeatherIcon from '@/components/ui/weather-icon.tsx'
import { CityDrawerInfo } from '@/components/weather/types.ts'
import { getStoredRecentCities, MAX_RECENT_CITIES, RECENT_STORAGE_KEY } from '@/lib/utils.ts'

interface SearchCityInfo {
  name: string
  province: string
  adm2: string
  showName: string
  lat: number
  lon: number
}

export default function CityDrawer() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [searchList, setSearchList] = useState<SearchCityInfo[]>([])
  const [recentCities, setRecentCities] = useState<CityDrawerInfo[]>(getStoredRecentCities)
  const { location, currentLocationInfo,baseLocationInfo, updateLocation } = useLocationContext()
  // 1. 使用ref存储定时器ID
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // 模拟数据，实际应该从API获取
  const currentLocation: CityDrawerInfo = {
    name: baseLocationInfo.name || '加载中',
    province: baseLocationInfo.province || '加载中',
    temp: baseLocationInfo.temp || 0,
    weather: baseLocationInfo.weatherText || '晴' ,
    lon: baseLocationInfo.longitude,
    lat: baseLocationInfo.latitude
  }

  const openChange = (open: boolean) => {
    setOpen(open)
    if (!open) {
      setSearch('')
      setSearchList([])
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    } else {
      // 打开抽屉时，从localstorage获取最近访问的城市
      setRecentCities(getStoredRecentCities)
    }
  }

  // 模糊搜索城市
  const searchCity = async (cityName: string) => {
    if (cityName) {
      const response = await geoLookupApi(cityName)
      const { code, data }: { data: GeoApiDataType[]; code: number } = response
      if (code === 200 && data.length > 0) {
        const result: SearchCityInfo[] = data
          .filter((item) => item.name && item.adm1 && item.adm2)
          .map((item) => {
            const name = item.name || ''
            const adm2 = item.adm2 || ''
            const adm1 = item.adm1 || ''
            return {
              name: item.name,
              province: item.adm1,
              adm2: item.adm2,
              lat: item.lat,
              lon: item.lon,
              showName: `${name}-${adm2}-${adm1}`
            }
          })
        setSearchList(result)
      } else {
        setSearchList([])
        if (code !== 200) {
          console.error(`Error: ${response.message}`)
        }
      }
    } else {
      setSearchList([])
    }
  }

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      searchCity(value)
    }, 500) // 300ms的延迟
  }

  const selectCity = (selectedCity: (SearchCityInfo | CityDrawerInfo)) => {
    // // 1. 准备要更新的地理位置信息
    const newLocation = {
      loading: false,
      accuracy: 150,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      latitude: selectedCity.lat,
      longitude: selectedCity.lon,
      speed: null,
      timestamp: new Date().getTime()
    }

    // 2. 更新最近访问列表（使用不可变方式）
    if (selectedCity.name !== baseLocationInfo.name && selectedCity.province !== baseLocationInfo.province) {
      const cityToRecent: CityDrawerInfo = {
        name: selectedCity.name,
        province: selectedCity.province,
        lat: selectedCity.lat,
        lon: selectedCity.lon,
        temp: -1,
        weather: ''
      }
      // 使用 filter 创建一个不包含当前选中城市的新数组
      const filteredCities = recentCities.filter(
        (item) => !(item.name === cityToRecent.name && item.province === cityToRecent.province)
      )
      // 将新城市添加到数组开头，并限制数量
      const updatedRecentCities = [cityToRecent, ...filteredCities].slice(0, MAX_RECENT_CITIES)

      // 3. 更新组件状态和 localStorage
      setRecentCities(updatedRecentCities)
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updatedRecentCities))
    }

    // 4. 调用上下文更新位置
    updateLocation(newLocation, selectedCity.name, selectedCity.province)

    // 5. 清理并关闭抽屉
    setSearch('')
    setOpen(false)
    setSearchList([])
  }

  const CityCard = ({ city, icon, onClick }: { city: CityDrawerInfo; icon: JSX.Element; onClick?: () => void }) => (
    <div onClick={onClick} className="flex cursor-pointer items-center justify-between rounded-lg p-4 transition-colors hover:bg-white/5">
      <div className="flex items-center gap-3">
        {icon}
        <div className="flex flex-col">
          <span className="font-medium text-white">{city.name}</span>
          <span className="text-sm text-white/60">{city.province}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <WeatherIcon weatherText={city.weather} />
        <span className="text-white">{city.temp}°</span>
      </div>
    </div>
  )

  return (
    <Drawer open={open} onOpenChange={openChange}>
      <DrawerTrigger asChild>
        <button className="rounded-lg p-2 transition-colors hover:bg-white/10">
          <HousePlus className="h-6 w-6 text-white" />
        </button>
      </DrawerTrigger>
      <DrawerContent className="border-zinc-800 bg-zinc-900">
        <div className="flex h-[calc(100vh-15rem)] flex-col">
          <DrawerHeader className="border-b border-zinc-800 px-4">
            <div className="mb-4 flex items-center justify-between">
              <DrawerTitle className="text-lg text-white">选择城市</DrawerTitle>
              <DrawerTrigger asChild>
                <button className="rounded-lg p-1 transition-colors hover:bg-white/10">
                  <X className="h-5 w-5 text-white" />
                </button>
              </DrawerTrigger>
            </div>
            <div className="relative mb-4">
              <Search className="absolute top-2 left-3 h-5 w-5 text-white/60" />
              <Input
                placeholder="搜索城市"
                value={search}
                onChange={(e) => handleSearchChange(e)}
                className="border-zinc-700 bg-zinc-800 pl-10 text-white placeholder:text-white/60"
              />
            </div>
          </DrawerHeader>

          <ScrollArea className="flex-1">
            {searchList.length > 0 ? (
              <div className="flex flex-col gap-2 p-2">
                {searchList.map((item: SearchCityInfo) => (
                  <div
                    key={item.lat + item.lon}
                    onClick={() => selectCity(item)}
                    className="border-b border-zinc-800 p-2 font-medium text-white"
                  >
                    {item.showName}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6 p-4">
                {/* 当前位置 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-white/60" />
                    <span className="text-sm text-white/60">当前位置</span>
                  </div>
                  <CityCard onClick={() => selectCity(currentLocation)} city={currentLocation} icon={<MapPin className="h-5 w-5 text-blue-400" />} />
                </div>

                {/* 最近访问 */}
                {recentCities.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-white/60" />
                      <span className="text-sm text-white/60">最近访问</span>
                    </div>
                    {recentCities.map((city) => (
                      <CityCard onClick={() => selectCity(city)} key={city.name} city={city} icon={<MapPin className="h-5 w-5 text-white/60" />} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
