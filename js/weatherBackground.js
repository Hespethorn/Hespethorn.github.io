// 引入必要的库，这里假设使用 axios 获取天气数据
import axios from 'axios';

// 定义五个时间段
const timeRanges = [
  { start: 0, end: 6, period: 'night' },
  { start: 6, end: 12, period: 'morning' },
  { start: 12, end: 18, period: 'afternoon' },
  { start: 18, end: 20, period: 'evening' },
  { start: 20, end: 24, period: 'night' }
];

// 定义天气类型
const weatherTypes = ['sunny', 'cloudy', 'rainy', 'snowy'];

// 获取当前时间段
function getCurrentPeriod() {
  const now = new Date();
  const hour = now.getHours();
  return timeRanges.find(range => hour >= range.start && hour < range.end).period;
}

// 获取天气数据，需要替换为实际的 API 密钥和地址
async function getWeatherData() {
  try {
    const response = await axios.get('https://api.weatherapi.com/v1/current.json?key=85f3079a56f0d649a44133c3a4820cb0&q=auto:ip');
    return response.data.current.condition.text.toLowerCase();
  } catch (error) {
    console.error('获取天气数据失败:', error);
    return 'unknown';
  }
}

// 根据天气和时间段设置背景和动画
function setBackground(weather, period) {
  const body = document.body;
  
  // 移除之前的背景和动画类
  body.className = body.className.replace(/bg-\w+|animate-\w+/g, '');
  
  // 添加新的背景和动画类
  body.classList.add(`bg-${weather}-${period}`);
  body.classList.add(`animate-${weather}-${period}`);
}

// 主函数
async function init() {
  const period = getCurrentPeriod();
  const weather = await getWeatherData();
  setBackground(weather, period);
}

// 初始化
init();

// 每隔一小时更新一次
setInterval(init, 60 * 60 * 1000);