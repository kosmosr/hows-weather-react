import { Cloud, CloudFog, CloudRain, CloudSnow, Cloudy, Sun } from 'lucide-react'

export default function WeatherIcon({ weatherText, iconSize = 24 }: { weatherText: string; iconSize?: number }) {
  if (weatherText.includes('晴')) {
    return <Sun size={iconSize} className="text-white" />
  } else if (weatherText.includes('阴')) {
    return <Cloud size={iconSize} className="text-white" />
  } else if (weatherText.includes('云')) {
    return <Cloudy size={iconSize} className="text-white" />
  } else if (weatherText.includes('雨')) {
    return <CloudRain size={iconSize} className="text-white" />
  } else if (weatherText.includes('雪')) {
    return <CloudSnow size={iconSize} className="text-white" />
  } else if (weatherText.includes('雾')) {
    return <CloudFog size={iconSize} className="text-white" />
  } else {
    return <Sun size={iconSize} className="text-white" />
  }
}
