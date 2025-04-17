interface ResponseState {
  code: number
  data: any
  message: string
}

export interface GeoApiDataType {
  name: string // 城市名称
  adm1: string // 省
  adm2: string // 市
  lat: number // 纬度
  lon: number // 经度
}

export interface GetWeatherApiDataType {
  temp: string // 温度
  feelsLike: string // 体感温度
  humidity: string // 湿度
  icon: string // 天气状况的图标代码
  text: string // 天气状况的文字描述
  dailyWeatherList: DailyWeatherData[] // 未来几天的天气预报
}

export interface DailyWeatherData {
  fxDate: string // 预报日期
  dayOfWeek: string // 星期几
  tempMax: string // 最高气温
  tempMin: string // 最低气温
  icon: string // 天气状况的图标代码
  text: string // 天气状况的文字描述
}

const API_PREFIX = import.meta.env.VITE_API_PREFIX + '/weather'

// 获取地理位置
export const geoLookupApi = async (location: string) => {
  const response = await fetch(`${API_PREFIX}/geo?location=${location}`)
  const data: ResponseState = await response.json()
  return data
}

export const getWeatherApi = async (location: string) => {
  const response = await fetch(`${API_PREFIX}/get?location=${location}`)
  const data: ResponseState = await response.json()
  return data
}
