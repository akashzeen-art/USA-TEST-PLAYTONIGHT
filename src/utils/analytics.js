// PlayTonight Analytics - localStorage based tracking

const STORAGE_KEYS = {
  PAGE_VIEWS: 'playtonight_page_views',
  BUTTON_CLICKS: 'playtonight_button_clicks',
  PAGE_TIMELINE: 'playtonight_page_timeline',
  BUTTON_TIMELINE: 'playtonight_button_timeline',
}

// Helper to get current hour key (UTC)
const getHourKey = () => {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')} ${String(now.getUTCHours()).padStart(2, '0')}:00`
}

// Get data from localStorage
const getData = (key) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

// Save data to localStorage
const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.warn('Analytics: Could not save to localStorage', e)
  }
}

// Track a page view
export const trackPageView = (path, pageName = '') => {
  // Don't track dashboard views
  if (path === '/dashboard') return

  // Update page views count
  const pageViews = getData(STORAGE_KEYS.PAGE_VIEWS)
  const key = path
  if (!pageViews[key]) {
    pageViews[key] = { path, name: pageName || path, clicks: 0 }
  }
  pageViews[key].clicks += 1
  pageViews[key].name = pageName || pageViews[key].name
  saveData(STORAGE_KEYS.PAGE_VIEWS, pageViews)

  // Update hourly timeline
  const timeline = getData(STORAGE_KEYS.PAGE_TIMELINE)
  const hourKey = getHourKey()
  timeline[hourKey] = (timeline[hourKey] || 0) + 1
  saveData(STORAGE_KEYS.PAGE_TIMELINE, timeline)
}

// Track a button click
export const trackButtonClick = (buttonLabel) => {
  // Update button clicks count
  const buttonClicks = getData(STORAGE_KEYS.BUTTON_CLICKS)
  if (!buttonClicks[buttonLabel]) {
    buttonClicks[buttonLabel] = { label: buttonLabel, clicks: 0 }
  }
  buttonClicks[buttonLabel].clicks += 1
  saveData(STORAGE_KEYS.BUTTON_CLICKS, buttonClicks)

  // Update hourly timeline
  const timeline = getData(STORAGE_KEYS.BUTTON_TIMELINE)
  const hourKey = getHourKey()
  timeline[hourKey] = (timeline[hourKey] || 0) + 1
  saveData(STORAGE_KEYS.BUTTON_TIMELINE, timeline)
}

// Get all analytics data
export const getAnalyticsData = () => {
  const pageViews = getData(STORAGE_KEYS.PAGE_VIEWS)
  const buttonClicks = getData(STORAGE_KEYS.BUTTON_CLICKS)
  const pageTimeline = getData(STORAGE_KEYS.PAGE_TIMELINE)
  const buttonTimeline = getData(STORAGE_KEYS.BUTTON_TIMELINE)

  // Calculate totals
  const totalPageViews = Object.values(pageViews).reduce((sum, p) => sum + p.clicks, 0)
  const totalTrackedPages = Object.keys(pageViews).length
  const totalButtonClicks = Object.values(buttonClicks).reduce((sum, b) => sum + b.clicks, 0)

  // Sort page views by clicks (descending)
  const sortedPageViews = Object.values(pageViews).sort((a, b) => b.clicks - a.clicks)

  // Sort button clicks by clicks (descending)
  const sortedButtonClicks = Object.values(buttonClicks).sort((a, b) => b.clicks - a.clicks)

  // Sort timelines by hour (most recent first)
  const sortedPageTimeline = Object.entries(pageTimeline)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([hour, count]) => ({ hour, count }))

  const sortedButtonTimeline = Object.entries(buttonTimeline)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([hour, count]) => ({ hour, count }))

  return {
    totalPageViews,
    totalTrackedPages,
    totalButtonClicks,
    pageViews: sortedPageViews,
    buttonClicks: sortedButtonClicks,
    pageTimeline: sortedPageTimeline,
    buttonTimeline: sortedButtonTimeline,
  }
}

// Clear all analytics data (for testing)
export const clearAnalytics = () => {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
}

// Tracked button wrapper - use this for onClick handlers
export const withTracking = (buttonLabel, originalHandler) => {
  return (e) => {
    trackButtonClick(buttonLabel)
    if (originalHandler) {
      originalHandler(e)
    }
  }
}

