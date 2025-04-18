import { Droplets, Heart, Shirt, Sun, Wind } from 'lucide-react'
import { GetWeatherApiDataType } from '@/lib/api.ts'

export default function LifeIndex({ weatherData }: { weatherData: GetWeatherApiDataType }) {
  const getIndexIcon = (type: string) => {
    switch (type) {
      // 运动指数
      case '1':
        return <Shirt className="h-5 w-5" />
      // 洗车指数
      case '2':
        return <Droplets className="h-5 w-5" />
      // 穿衣指数
      case '3':
        return <Heart className="h-5 w-5" />
      // 紫外线指数
      case '5':
        return <Sun className="h-5 w-5" />
      // 晾晒指数
      case '14':
        return <Wind className="h-5 w-5" />
    }
  }

  return (
    <div className="rounded-xl bg-white/20 backdrop-blur-sm">
      <div className="divide-y divide-white/10">
        {weatherData.indicesList.map((index, i) => (
          <div key={i} className="flex items-start p-4">
            <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white">
              {getIndexIcon(index.type)}
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm text-white/80">{index.name}</span>
                <span className="text-sm font-medium text-white">{index.category}</span>
              </div>
              <p className="text-xs text-white/60">{index.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
