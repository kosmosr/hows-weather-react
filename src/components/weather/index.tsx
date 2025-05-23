import { ChevronDown, ChevronUp } from 'lucide-react'
import WeatherHeader from '@/components/weather/WeatherHeader.tsx'
import WeatherMetrics from '@/components/weather/WeatherMetrics.tsx'
import HourlyForecast from '@/components/weather/HourlyForecast.tsx'
import WeeklyForecast from '@/components/weather/WeeklyForecast.tsx'
import { useLocationContext } from '@/hooks/location-provider.tsx'
import { useEffect, useState } from 'react'
import { getWeatherApi, GetWeatherApiDataType } from '@/lib/api.ts'
import WeatherIcon from '@/components/ui/weather-icon.tsx'
import { CityDrawerInfo } from '@/components/weather/types.ts'
import { getStoredRecentCities, roundCoordinate } from '@/lib/utils.ts'
import LifeIndex from '@/components/weather/LifeIndex.tsx'

const RECENT_STORAGE_KEY = 'recent_cities_key'

const updateRecentCityWeather = (weather: GetWeatherApiDataType, lat: number, lon: number,) => {
  console.log('updateRecentCityWeather', lat, lon, weather)
  if (!lat || !lon) return

  try {
    const recentCities: CityDrawerInfo[] = getStoredRecentCities()
    const cityIndex = recentCities.findIndex((c) => roundCoordinate(c.lat) === lat && roundCoordinate(c.lon) === lon)
    if (cityIndex > -1) {
      const cityToUpdate = recentCities[cityIndex]
      // 创建更新后的城市对象，添加天气信息
      const updatedCity: CityDrawerInfo = {
        ...cityToUpdate,
        temp: parseInt(weather.temp),
        weather: weather.text
      }
      // 创建新的最近访问列表（不可变更新）
      const updatedRecentCities = [
        ...recentCities.slice(0, cityIndex), // 更新项之前的部分
        updatedCity, // 更新后的值
        ...recentCities.slice(cityIndex + 1) // 更新项之后的部分
      ]
      // save to localstorage
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updatedRecentCities))
    }
  } catch (e) {
    console.error('Error updating recent cities:', e)
  }
}

export default function Weather() {
  const { location, updateLocationWeather, currentLocationInfo } = useLocationContext()
  const [weatherData, setWeatherData] = useState<GetWeatherApiDataType>({
    temp: '',
    feelsLike: '',
    humidity: '',
    icon: '',
    text: '',
    dailyWeatherList: [],
    hourlyWeatherList: [],
    indicesList: [],
    windDir: '',
    windScale: '',
    windSpeed: '',
  })

  const [tempMax, setTempMax] = useState('')
  const [tempMin, setTempMin] = useState('')

  useEffect(() => {
    // console.log(`before update current: ${JSON.stringify(currentLocationInfo)}`)
    if (currentLocationInfo.latitude && currentLocationInfo.longitude
      && currentLocationInfo.name && currentLocationInfo.province
      && !currentLocationInfo.temp
      && !currentLocationInfo.weatherText) {
      const fetchWeather = async () => {
        const response = await getWeatherApi(`${currentLocationInfo.longitude},${currentLocationInfo.latitude}`)
        const { code, data }: { code: number; data: GetWeatherApiDataType } = response
        if (code === 200) {
          setWeatherData(data)
          setTempMax(data.dailyWeatherList[0].tempMax)
          setTempMin(data.dailyWeatherList[0].tempMin)
          // 更新最近访问的城市天气
          console.log(`before update current: ${JSON.stringify(currentLocationInfo)}`)
          updateRecentCityWeather(data, currentLocationInfo.latitude, currentLocationInfo.longitude)
          updateLocationWeather(parseInt(data.temp), data.text, currentLocationInfo.latitude, currentLocationInfo.longitude)
        }
      }
      fetchWeather()
    }
  }, [currentLocationInfo])

  // 定义一个辅助函数来根据天气文本获取背景样式
  const getBackgroundStyle = (weatherText: string) => {
    let backgroundColor = ''
    // 默认背景 (深色)
    const defaultBackgroundColor = '#333333' // 深灰色

    // 根据天气文本设置不同的背景渐变
    // 你可以根据实际需要调整颜色或使用背景图片 (backgroundImage: 'url(...)')
    if (weatherText.includes('晴')) {
      // 晴天
      backgroundColor = '#A2CFFE' // 淡蓝色
    } else if (weatherText.includes('云') || weatherText.includes('阴')) {
      // 多云或阴天
      backgroundColor = '#B0C4DE' // 灰蓝色
    } else if (weatherText.includes('雨') || weatherText.includes('雾')) {
      // 雨天
      backgroundColor = '#708090' // 石板灰
    } else if (weatherText.includes('雪')) {
      // 雪天
      backgroundColor = '#eef2f3' // 淡灰色
    } else {
      // 其他天气或默认情况
      backgroundColor = defaultBackgroundColor
    }

    // 返回包含背景样式和过渡效果的对象
    return {
      backgroundColor: backgroundColor, // 使用 backgroundColor
      // backgroundSize: 'cover', // 对纯色背景意义不大
      // backgroundPosition: 'center', // 对纯色背景意义不大
    }
  }

  // 计算动态背景样式
  const backgroundStyle = getBackgroundStyle(weatherData.text)

  return (
    <div className={`fixed inset-0 flex flex-col text-white`} style={backgroundStyle}>
      {/*Header*/}
      <div className={`text-white sticky top-0 z-10`}>
        <WeatherHeader />
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-8">
        {/*Temperature */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex flex-col justify-between gap-2 text-white">
            <span className="text-7xl">{weatherData.temp}°</span>
            <span className="text-2xl text-white/80">{weatherData.text || '加载中...'}</span>
            <div className="flex gap-5">
              <div className="flex items-center gap-1">
                <ChevronUp size={13} strokeWidth={4} />
                <span className="text-base font-light">{tempMax}°</span>
              </div>
              <div className="flex items-center gap-1">
                <ChevronDown size={13} strokeWidth={4} />
                <span className="text-base font-light">{tempMin}°</span>
              </div>
            </div>
          </div>
          <div>
            <WeatherIcon weatherText={weatherData.text} iconSize={140} />
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {/*Weather metrics*/}
          <WeatherMetrics weatherData={weatherData} />

          <div className="flex flex-col gap-2">
            <span className="text-white/80">每小时预报</span>
            <HourlyForecast weatherData={weatherData} />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-white/80">未来预报</span>
            <WeeklyForecast temp={weatherData.temp} dailyWeatherData={weatherData.dailyWeatherList} />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-white/80">生活指数</span>
            <LifeIndex weatherData={weatherData} />
          </div>
        </div>
      </div>
    </div>
  )
}
