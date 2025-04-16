import { Sun } from 'lucide-react';

export default function HourlyForecast() {
  // Sample forecast data - in real app this would come from props or API
  const forecasts = [
    { time: '现在', temp: 30, windSpeed: 3 },
    { time: '13:00', temp: 31, windSpeed: 4 },
    { time: '14:00', temp: 32, windSpeed: 3 },
    { time: '15:00', temp: 29, windSpeed: 5 },
    { time: '16:00', temp: 28, windSpeed: 4 },
    { time: '17:00', temp: 27, windSpeed: 3 },
    { time: '18:00', temp: 26, windSpeed: 2 },
    { time: '19:00', temp: 25, windSpeed: 3 },
    { time: '20:00', temp: 24, windSpeed: 4 },
    { time: '21:00', temp: 23, windSpeed: 3 }
  ];

  return (
    <>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3.5 min-w-min">
          {forecasts.map((forecast, index) => (
            <div
              key={index}
              className="flex flex-col bg-white/20 rounded-3xl items-center gap-2 px-6 py-2 min-w-max"
            >
              <span>{forecast.time}</span>
              <Sun size={30} className="text-white" />
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
