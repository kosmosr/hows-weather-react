import { GetWeatherApiDataType } from '@/lib/api.ts'
import WeatherIcon from '@/components/ui/weather-icon.tsx'

export default function HourlyForecast({ weatherData }: { weatherData: GetWeatherApiDataType }) {
  return (
    <>
      <div className="scrollbar-hide overflow-x-auto">
        <div className="flex min-w-min gap-3.5">
          {weatherData.hourlyWeatherList.map((forecast, index) => (
            <div key={index} className="flex min-w-max flex-col items-center gap-2 rounded-3xl bg-white/20 px-6 py-2">
              <span>{forecast.fxDate}</span>
              <WeatherIcon iconSize={30} weatherText={forecast.text} />
              <span>{forecast.temp}°</span>
              <span className="text-xs text-gray-100">{forecast.windSpeed}km/h</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  )
}
