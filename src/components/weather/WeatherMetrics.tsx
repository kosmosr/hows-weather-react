import { LucideIcon, Thermometer, Waves, Wind } from 'lucide-react'
import { GetWeatherApiDataType } from '@/lib/api.ts'

interface WeatherMetricProps {
  icon: LucideIcon
  value: string
  label: string
}

// 天气图标大小
const WEATHER_METRIC_ICON_SIZE = 25

const WeatherMetric = ({ icon: Icon, value, label }: WeatherMetricProps) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <Icon size={WEATHER_METRIC_ICON_SIZE} className="text-white/70" />
      <span className="text-base text-white">{value}</span>
      <span className="text-sm text-gray-100">{label}</span>
    </div>
  )
}

export default function WeatherMetrics({ weatherData }: { weatherData: GetWeatherApiDataType }) {
  const metrics = [
    { icon: Thermometer, value: weatherData.feelsLike + '°', label: '体感温度' },
    { icon: Wind, value: `${weatherData.windSpeed}km/h`, label: `${weatherData.windDir}${weatherData.windScale}级` },
    { icon: Waves, value: weatherData.humidity + '%', label: '湿度' }
  ]

  return (
    <div className="flex justify-between rounded-3xl bg-white/20 px-7 py-5">
      {metrics.map((metric, index) => (
        <WeatherMetric key={index} {...metric} />
      ))}
    </div>
  )
}
