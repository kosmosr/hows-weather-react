'use client'
import { ChevronDown, ChevronUp, Cloud, CloudRain, CloudSnow, CloudSun, Cloudy, Sun } from 'lucide-react'
import { useState } from 'react'
import { DailyWeatherData } from '@/lib/api.ts'
import WeatherIcon from '@/components/ui/weather-icon.tsx'

// Props 类型定义，增加了 textColorClass
interface WeeklyForecastProps {
  temp: string
  dailyWeatherData: DailyWeatherData[]
}

// 改造后的温度条组件
const TempBar = ({ minTemp, maxTemp, temp, maxScale, minScale }:
                 { minTemp: number; maxTemp: number; temp: number, maxScale: number, minScale: number }) => {
  // 定义温度刻度的视觉范围，可以根据实际需要调整
  const MIN_TEMP_SCALE = minScale
  const MAX_TEMP_SCALE = maxScale
  const totalScaleRange = MAX_TEMP_SCALE - MIN_TEMP_SCALE

  // 防止除以零或无效范围
  if (totalScaleRange <= 0) return null

  // 计算温度条宽度百分比
  const barWidthPercent = Math.max(0, ((maxTemp - minTemp) / totalScaleRange) * 100)
  // 计算温度条左侧偏移百分比
  const barLeftPercent = Math.max(0, ((minTemp - MIN_TEMP_SCALE) / totalScaleRange) * 100)

  return (
    // 外部容器，代表完整的温度刻度范围
    <div className={`mx-2 h-1.5 flex-1 rounded-full bg-gray-500/30`}>
      {/* 内部实际的温度条 */}
      <div
        className="h-full rounded-full"
        style={{
          marginLeft: `${barLeftPercent}%`, // 使用 margin-left 定位
          width: `${barWidthPercent}%`, // 设置宽度
          background: 'linear-gradient(to right, #93c5fd, #fde047)' // 应用动态渐变 黄 -> 浅蓝
        }}
      />
    </div>
  )
}

const WeeklyForecast = ({ dailyWeatherData, temp }: WeeklyForecastProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const expandSize = 5
  // 找出 dailyWeatherData 中的最大值和最小值
  const maxTempScale = Math.max(...dailyWeatherData.map((item) => parseInt(item.tempMax)))
  const minTempScale = Math.min(...dailyWeatherData.map((item) => parseInt(item.tempMin)))

  const forecasts = [
    { dayOfWeek: '昨天', date: '12月11日', maxTemp: 11, minTemp: 3, weather: 'cloudy-rain' },
    { dayOfWeek: '今天', date: '12月12日', maxTemp: 10, minTemp: 4, weather: 'cloudy-rain' },
    { dayOfWeek: '周五', date: '12月13日', maxTemp: 9, minTemp: 3, weather: 'sunny' },
    { dayOfWeek: '周六', date: '12月14日', maxTemp: 11, minTemp: 0, weather: 'partly-cloudy' },
    { dayOfWeek: '周日', date: '12月15日', maxTemp: 12, minTemp: 1, weather: 'sunny' },
    { dayOfWeek: '周一', date: '12月16日', maxTemp: 11, minTemp: 4, weather: 'cloudy-rain' },
    { dayOfWeek: '周二', date: '12月17日', maxTemp: 8, minTemp: 4, weather: 'partly-cloudy' }
  ]

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'sunny':
        return <Sun className="h-7 w-7 text-white" />
      case 'cloudy-rain':
        return <CloudRain className="h-6 w-6 text-white" />
      case 'cloudy':
        return <Cloud className="h-6 w-6 text-white" />
      case 'partly-cloudy':
        return <CloudSun className="h-6 w-6 text-white" />
      default:
        return <Sun className="h-6 w-6 text-white" />
    }
  }

  /*const TempBar = ({ minTemp, maxTemp }: { minTemp: number, maxTemp: number }) => {
    const MIN_TEMP = 0
    const MAX_TEMP = 40
    const totalWidth = MAX_TEMP - MIN_TEMP

    // Calculate positions
    const rangeWidth = ((maxTemp - minTemp) / totalWidth) * 250 // 转换为百分比

    return (
      <div className="flex h-1.5 rounded-full bg-gradient-to-r from-orange-400 to-blue-400" style={{
        width: `${rangeWidth}%`,
      }}>
      </div>
    )
  }*/

  // 移除写死的 forecasts，直接使用传入的 dailyWeatherData
  // 确保 dailyWeatherData 是数组
  const validWeatherData = Array.isArray(dailyWeatherData) ? dailyWeatherData : []

  const visibleForecasts = isExpanded ? validWeatherData : validWeatherData.slice(0, expandSize)

  return (
    <div className="max-w-md min-w-full rounded-xl bg-white/20 px-4 py-2 backdrop-blur-sm">
      {visibleForecasts.map((forecast, index) => (
        <div
          key={index}
          className="flex items-center justify-between border-b border-white/10 py-3.5 first:pt-1 last:border-0 last:pb-0"
        >
          <div className="flex w-18 flex-col text-sm">
            <span className="font-medium">{forecast.dayOfWeek}</span>
            <span className="text-sm text-white/70">{forecast.fxDate}</span>
          </div>
          {/* 温度条和数值 */}
          <div className="mx-2 flex flex-1 items-center">
            {/* 增加左右 margin */}
            {/* 最低温 */}
            <span className={`ml-1 w-8 text-left text-sm text-white/70`}>{forecast.tempMin}°</span>
            {/* 温度条组件 */}
            <TempBar minTemp={parseInt(forecast.tempMin)} maxTemp={parseInt(forecast.tempMax)} maxScale={maxTempScale} minScale={minTempScale} temp={parseInt(temp)} />
            {/* 最高温 */}
            <span className="mr-1 w-8 text-right text-sm">{forecast.tempMax}°</span> {/* 调整宽度和对齐 */}
          </div>
          {/* 天气图标 */}
          <div className="flex w-8 justify-center">
            {/* 居中图标 */}
            <WeatherIcon weatherText={forecast.text} />
          </div>
        </div>
      ))}

      {/* 展开/收起按钮 */}
      {validWeatherData.length > expandSize && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`mt-2 flex w-full items-center justify-center rounded py-2 text-white/80 transition-colors hover:text-white`}
        >
          <div className="flex items-center gap-1 text-sm">
            <span>{isExpanded ? '收起' : `显示后 ${validWeatherData.length - expandSize} 天`}</span>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </button>
      )}
    </div>
  )
}

export default WeeklyForecast
