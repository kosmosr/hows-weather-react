import { ChevronDown, ChevronUp } from 'lucide-react'
import WeatherHeader from '@/components/weather/WeatherHeader.tsx'
import WeatherMetrics from '@/components/weather/WeatherMetrics.tsx'
import HourlyForecast from '@/components/weather/HourlyForecast.tsx'
import WeeklyForecast from '@/components/weather/WeeklyForecast.tsx'
import { useLocationContext } from '@/hooks/location-provider.tsx'
import { useCallback, useEffect, useState } from 'react'
import { getWeatherApi, GetWeatherApiDataType } from '@/lib/api.ts'
import WeatherIcon from '@/components/ui/weather-icon.tsx'
import { CityDrawerInfo } from '@/components/weather/types.ts'
import { getStoredRecentCities } from '@/lib/utils.ts'

const RECENT_STORAGE_KEY = 'recent_cities_key'

const updateRecentCityWeather = ((currentCity: string, currentProvince: string, weather: GetWeatherApiDataType) => {
  console.log('updateRecentCityWeather', currentCity, currentProvince, weather)
  if (!currentCity || !currentProvince) return

  try {
    const recentCities: CityDrawerInfo[] = getStoredRecentCities()
    const cityIndex = recentCities.findIndex((c) => c.name === currentCity && c.province === currentProvince)
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
})

export default function Weather() {
  const { location, province: currentProvince, city: currentCity , updateLocationWeather} = useLocationContext()
  const [weatherData, setWeatherData] = useState<GetWeatherApiDataType>({
    temp: '',
    feelsLike: '',
    humidity: '',
    icon: '',
    text: '',
    dailyWeatherList: []
  })

  const [tempMax, setTempMax] = useState('')
  const [tempMin, setTempMin] = useState('')



  useEffect(() => {
    if (!location.loading && location.latitude && location.longitude) {
      const fetchWeather = async () => {
        const response = await getWeatherApi(`${location.longitude},${location.latitude}`)
        const { code, data }: { code: number; data: GetWeatherApiDataType } = response
        if (code === 200) {
          setWeatherData(data)
          setTempMax(data.dailyWeatherList[0].tempMax)
          setTempMin(data.dailyWeatherList[0].tempMin)
          // 更新最近访问的城市天气
          updateRecentCityWeather(currentCity, currentProvince, data)
          updateLocationWeather(parseInt(data.temp), data.text, currentCity, currentProvince)
        }
      }
      fetchWeather()
    }
  }, [location])

  // 定义一个辅助函数来根据天气文本获取背景样式
  const getBackgroundStyle = (weatherText: string) => {
    let backgroundStyle = {}
    // 默认背景 (深色渐变)
    const defaultStyle = { background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.6))' }

    // 根据天气文本设置不同的背景渐变
    // 你可以根据实际需要调整颜色或使用背景图片 (backgroundImage: 'url(...)')
    if (weatherText.includes('晴')) {
      // 晴天
      backgroundStyle = { background: 'linear-gradient(to bottom, #A2CFFE, #4682B4)' } // 蓝色渐变
    } else if (weatherText.includes('云') || weatherText.includes('阴')) {
      // 多云或阴天
      backgroundStyle = { background: 'linear-gradient(to bottom, #B0C4DE, #778899)' } // 灰色渐变
    } else if (weatherText.includes('雨')) {
      // 雨天
      backgroundStyle = { background: 'linear-gradient(to bottom, #708090, #778899)' } // 深蓝色渐变
    } else if (weatherText.includes('雪')) {
      // 雪天
      backgroundStyle = { background: 'linear-gradient(to bottom, #eef2f3, #8e9eab)' } // 浅灰色/白色渐变
    } else {
      // 其他天气或默认情况
      backgroundStyle = defaultStyle
    }

    // 返回包含背景样式和过渡效果的对象
    return {
      ...backgroundStyle,
      backgroundSize: 'cover', // 背景覆盖整个区域
      backgroundPosition: 'center', // 背景居中
      transition: 'background 0.5s ease-in-out' // 添加背景过渡动画
    }
  }

  // 计算动态背景样式
  const backgroundStyle = getBackgroundStyle(weatherData.text)

  return (
    <div className={`fixed inset-0 flex flex-col text-white`} style={backgroundStyle}>
      {/*Header*/}
      <div className={`text-white'} sticky top-0 z-10 backdrop-blur-sm`}>
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
            {/*<i className={'qi-'+ weatherData.icon + '-fill text-9xl'}></i>*/}
            <WeatherIcon weatherText={weatherData.text} iconSize={140} />
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {/*Weather metrics*/}
          <WeatherMetrics feelsLike={weatherData.feelsLike} humidity={weatherData.humidity} />

          <div className="flex flex-col gap-2">
            <span className="text-white/80">每小时预报</span>
            <HourlyForecast />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-white/80">未来预报</span>
            <WeeklyForecast temp={weatherData.temp} dailyWeatherData={weatherData.dailyWeatherList} />
          </div>
        </div>
      </div>
    </div>
  )
}
