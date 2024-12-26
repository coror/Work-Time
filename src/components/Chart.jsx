import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import Parse from 'parse' // Assuming you're using Parse SDK
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export function Chart({ name, dataKey }) {
  const [clickedData, setClickedData] = useState(null)
  const [chartData, setChartData] = useState([])

  // Fetch data from backend
  const fetchDataFromBackend = async () => {
    try {
      const userId = Parse.User.current()?.id // Ensure the user is logged in
      if (!userId) throw new Error('User not authenticated')

      const response = await Parse.Cloud.run('fetchStudyData', { userId })
      const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ]

      // Process the backend data
      const data = response.map((item) => {
        const [month, year] = item.storageKey.split('_') // e.g., "January_2023"
        const monthYearLabel = `${month.substr(0, 3)}${year
          .toString()
          .substr(2)}`
        return {
          month: monthYearLabel,
          programming: item.programmingHours.reduce(
            (sum, value) => sum + (parseInt(value) || 0),
            0,
          ),
          fitness: item.fitnessHours.reduce(
            (sum, value) => sum + (parseInt(value) || 0),
            0,
          ),
        }
      })

      // Sort data by month-year, considering both year and month
      data.sort((a, b) => {
        const [monthA, yearA] = a.month.match(/([A-Za-z]+)(\d+)/).slice(1)
        const [monthB, yearB] = b.month.match(/([A-Za-z]+)(\d+)/).slice(1)
        const monthIndexA = months.indexOf(monthA)
        const monthIndexB = months.indexOf(monthB)
        if (yearA !== yearB) return yearA - yearB
        return monthIndexA - monthIndexB
      })

      setChartData(data) // Set the aggregated and sorted data
    } catch (error) {
      console.error('Error fetching data from backend:', error)
    }
  }

  // Load data when component mounts
  useEffect(() => {
    fetchDataFromBackend()
  }, [])

  // Handle bar click event
  const handleBarClick = (data) => {
    if (data.activePayload && data.activePayload[0]) {
      const clickedMonth = data.activeLabel
      const clickedValue = data.activePayload[0]?.value
      setClickedData({ month: clickedMonth, value: clickedValue })
    } else {
      setClickedData(null)
    }
  }

  return (
    <div className='p-4 bg-white shadow-lg rounded-lg border border-gray-200 max-w-lg mx-auto'>
      <h3 className='text-center text-xl font-semibold text-gray-800 mb-4'>
        {name}
      </h3>

      {/* Display the clicked month and its value */}
      {clickedData && (
        <p className='text-center text-sm text-gray-600'>
          {clickedData.month} {clickedData.value} minutes
        </p>
      )}

      <div className='h-72 -ml-10'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart
            data={chartData} // Use the filtered chart data
            margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
            onClick={handleBarClick}
          >
            <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
            <XAxis dataKey='month' tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#374151' }}
              itemStyle={{ color: '#4b5563' }}
            />
            <Bar
              dataKey={dataKey}
              fill={dataKey === 'programming' ? '#3b82f6' : '#10b981'}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

Chart.propTypes = {
  name: PropTypes.string.isRequired,
  dataKey: PropTypes.string.isRequired,
}
