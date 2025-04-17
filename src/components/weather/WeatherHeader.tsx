import CityDrawer from '@/components/weather/CityDrawer.tsx'
import { useLocationContext } from '@/hooks/location-provider.tsx'

export default function WeatherHeader() {
  const {location, currentLocationInfo } = useLocationContext()

  return (
    <div className="flex items-center justify-between px-5 py-2">
      <div className="flex flex-col">
        <span className="text-lg font-bold text-white">{location.loading ? '获取定位中' : currentLocationInfo.name}</span>
        <span className="text-sm text-white/60">{location.loading ? '' : currentLocationInfo.province}</span>
      </div>

      <div className="flex gap-4">
        <CityDrawer />
      </div>
    </div>
  )
}
