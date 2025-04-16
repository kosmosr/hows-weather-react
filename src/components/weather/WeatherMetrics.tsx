import { LucideIcon, Thermometer, Waves, Wind } from 'lucide-react'

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

export default function WeatherMetrics({feelsLike, humidity} : {feelsLike: string, humidity: string}) {
  const metrics = [
    { icon: Thermometer, value: feelsLike + '°', label: '体感温度' },
    { icon: Wind, value: '54/优', label: '空气质量' },
    { icon: Waves, value: humidity + '%', label: '湿度' }
  ]

  return (
    <div className="flex justify-between rounded-3xl bg-white/20 px-7 py-5">
      {metrics.map((metric, index) => (
        <WeatherMetric key={index} {...metric} />
      ))}
    </div>
  )
}
