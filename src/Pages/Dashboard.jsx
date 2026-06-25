import { useState, useEffect } from 'react'
import { getAnalyticsData, clearAnalytics } from '../utils/analytics'

const Dashboard = () => {
  const [data, setData] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const loadData = () => {
      setData(getAnalyticsData())
    }
    loadData()

    // Auto-refresh every 5 seconds
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [refreshKey])

  const handleRefresh = () => {
    setData(getAnalyticsData())
  }

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all analytics data?')) {
      clearAnalytics()
      setRefreshKey(prev => prev + 1)
    }
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#aa1541] text-white py-4 px-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">
            Dashboard – <span className="font-normal">PlayTonight</span>
          </h1>
          <p className="text-white/90 text-sm">Real-time page click tracking</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 transition text-sm"
          >
            ↻ Refresh
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-white border border-gray-200 rounded-md text-red-600 hover:bg-red-50 transition text-sm"
          >
            Clear Data
          </button>
        </div>

        {/* Overview Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <p className="text-gray-500 text-sm mb-1">Total Page Views</p>
              <p className="text-3xl font-bold text-[#aa1541]">{data.totalPageViews}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <p className="text-gray-500 text-sm mb-1">Tracked Pages</p>
              <p className="text-3xl font-bold text-[#aa1541]">{data.totalTrackedPages}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <p className="text-gray-500 text-sm mb-1">Button Clicks (All)</p>
              <p className="text-3xl font-bold text-[#aa1541]">{data.totalButtonClicks}</p>
            </div>
          </div>
        </div>

        {/* Page Views by Route */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Page Views by Route</h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Page</th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-600">Path</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">Clicks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.pageViews.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400 text-sm">
                      No page views recorded yet. Navigate around the site to see stats here.
                    </td>
                  </tr>
                ) : (
                  data.pageViews.map((page, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-[#aa1541]">{page.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-center">{page.path}</td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">{page.clicks}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Page Views Timeline */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Page Views Timeline (per hour)</h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Hour (UTC)</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">Page Views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.pageTimeline.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-gray-400 text-sm">
                      No page views recorded yet. Navigate around the site to see hourly stats.
                    </td>
                  </tr>
                ) : (
                  data.pageTimeline.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-[#aa1541]">{item.hour}</td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">{item.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Button Clicks */}
        <div className="mb-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Button Clicks</h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Button</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">Clicks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.buttonClicks.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-gray-400 text-sm">
                      No button clicks recorded yet. Interact with buttons on the site to see stats here.
                    </td>
                  </tr>
                ) : (
                  data.buttonClicks.map((btn, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{btn.label}</td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">{btn.clicks}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-gray-400 text-xs mb-8">
          Counts are stored in the browser and updated immediately whenever a tracked button is clicked.
        </p>

        {/* Button Click Timeline */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Button Click Timeline (per hour)</h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Hour (UTC)</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">Button Clicks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.buttonTimeline.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-gray-400 text-sm">
                      No button clicks recorded yet. Interact with buttons to see hourly stats.
                    </td>
                  </tr>
                ) : (
                  data.buttonTimeline.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-[#aa1541]">{item.hour}</td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">{item.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard