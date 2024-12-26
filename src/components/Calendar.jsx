import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import Parse from 'parse' // Ensure Parse SDK is imported
import Button from './UI/Button'
import ResponseModal from './UI/ResponseModal'

// Helper function to calculate totals and averages
const calculateTotalAndAverage = (data) => {
  const validEntries = data.filter((value) => value !== '' && !isNaN(value)) // Filter non-empty and valid numbers
  const total = validEntries.reduce(
    (sum, value) => sum + parseInt(value, 10),
    0,
  )
  const average = validEntries.length > 0 ? total / validEntries.length : 0 // Avoid division by zero
  return { total, average }
}

export function Calendar({ month, year }) {
  const [programmingHours, setProgrammingHours] = useState([])
  const [fitnessHours, setFitnessHours] = useState([])
  const [workData, setWorkData] = useState([])
  const [modalMessage, setModalMessage] = useState(null) // Modal message state
  const [modalTitle, setModalTitle] = useState('') // Modal title (Success/Error)
  const [activeCell, setActiveCell] = useState(null)

  // Helper function to load data from the backend
  const loadDataFromBackend = async () => {
    try {
      const currentUser = Parse.User.current()
      if (!currentUser) {
        throw new Error('User not authenticated')
      }

      const monthYearKey = `${month}_${year}`
      const StudyData = Parse.Object.extend('StudyData')
      const query = new Parse.Query(StudyData)
      query.equalTo('user', currentUser)
      query.equalTo('storageKey', monthYearKey)

      const data = await query.first()

      if (data) {
        return {
          programmingHours: data.get('programmingHours') || Array(31).fill(''),
          fitnessHours: data.get('fitnessHours') || Array(31).fill(''),
          workData: data.get('workData') || Array(31).fill(''),
        }
      }

      // If no data exists, return empty arrays
      return {
        programmingHours: Array(31).fill(''),
        fitnessHours: Array(31).fill(''),
        workData: Array(31).fill(''),
      }
    } catch (error) {
      console.error('Error loading data from backend:', error)
      return {
        programmingHours: Array(31).fill(''),
        fitnessHours: Array(31).fill(''),
        workData: Array(31).fill(''),
      }
    }
  }

  // Function to initialize data based on month/year
  const initializeData = async () => {
    const data = await loadDataFromBackend()
    setProgrammingHours(data.programmingHours)
    setFitnessHours(data.fitnessHours)
    setWorkData(data.workData)
  }

  // Reinitialize data whenever the month or year changes
  useEffect(() => {
    initializeData()
  }, [month, year])

  // Handle input changes
  const handleChange = (index, category, value) => {
    setActiveCell({ index, category })

    if (category === 'programming') {
      const updatedData = [...programmingHours]
      updatedData[index] = value
      setProgrammingHours(updatedData)
    } else if (category === 'fitness') {
      const updatedData = [...fitnessHours]
      updatedData[index] = value
      setFitnessHours(updatedData)
    } else if (category === 'work') {
      const updatedData = [...workData]
      updatedData[index] = value
      setWorkData(updatedData)
    }
  }

  // Handle submit
  const handleSubmit = async () => {
    try {
      const currentUser = Parse.User.current()
      if (!currentUser) {
        throw new Error('User not authenticated')
      }

      const monthYearKey = `${month}_${year}`
      const params = {
        userId: currentUser.id,
        monthYearKey,
        programmingHours,
        fitnessHours,
        workData,
      }

      await Parse.Cloud.run('saveStudyData', params)
      setActiveCell(null)
      setModalTitle('Success') // Set title for success
      setModalMessage('Data saved successfully!')
    } catch (error) {
      console.error('Error saving data to backend:', error)
      setModalTitle('Error') // Set title for error
      setModalMessage('Error saving data. Please try again.')
    }
  }

  // Close modal
  const closeModal = () => {
    setModalMessage(null)
    setModalTitle('') // Reset modal title
  }

  // Get the number of days in the current month (e.g., 31 days for December)
  const daysInMonth = new Date(
    year,
    new Date(Date.UTC(year, new Date().getMonth())).getMonth() + 1,
    0,
  ).getDate()
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Calculate totals and averages for Programming, Fitness, and Work
  const programmingStats = calculateTotalAndAverage(programmingHours)
  const fitnessStats = calculateTotalAndAverage(fitnessHours)
  const workStats = calculateTotalAndAverage(workData)

  return (
    <div className='mt-8 flex flex-col items-center justify-center '>
      <h4 className='text-center text-xl font-semibold text-gray-800 mb-4'>
        {month} {year}
      </h4>
      <table className=' text-sm lg:text-base table-auto border-collapse border border-gray-300'>
        <thead>
          <tr className=''>
            <th className='max-w-20 border border-gray-300 p-1 lg:w-14 lg:p-2 text-center'>
              Date
            </th>
            <th className='max-w-26  border border-gray-300 p-1 lg:w-40 lg:p-2 text-center'>
              Coding
            </th>
            <th className='max-w-26  border border-gray-300 p-1 lg:w-40 lg:p-2 text-center'>
              Fitness
            </th>
            <th className='max-w-26  border border-gray-300 lg:w-40 p-1 lg:p-2 text-center'>
              Work
            </th>
          </tr>
        </thead>
        <tbody>
          {daysArray.map((date, index) => (
            <tr key={date}>
              <td className='border border-gray-300 p-2 text-center'>{date}</td>
              {['programming', 'fitness', 'work'].map((category) => (
                <td
                  key={category}
                  className='border border-gray-300 p-1 text-center'
                >
                  <input
                    type='number'
                    value={
                      category === 'programming'
                        ? programmingHours[index] || ''
                        : category === 'fitness'
                          ? fitnessHours[index] || ''
                          : workData[index] || ''
                    }
                    onChange={(e) =>
                      handleChange(index, category, e.target.value)
                    }
                    className=' max-w-20 lg:w-32 p-1 text-center border rounded border-gray-300'
                  />
                  {activeCell &&
                    activeCell.index === index &&
                    activeCell.category === category && (
                      <Button
                        onClick={handleSubmit}
                        className='mt-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600'
                      >
                        Submit
                      </Button>
                    )}
                </td>
              ))}
            </tr>
          ))}
          <tr className='font-semibold bg-gray-100'>
            <td className='border border-gray-300 p-2 text-center'>Total</td>
            <td className='border border-gray-300 p-2 text-center'>
              {programmingStats.total}
            </td>
            <td className='border border-gray-300 p-2 text-center'>
              {fitnessStats.total}
            </td>
            <td className='border border-gray-300 p-2 text-center'>
              {workStats.total}
            </td>
          </tr>
          <tr className='font-semibold bg-gray-100'>
            <td className='border border-gray-300 p-2 text-center'>Average</td>
            <td className='border border-gray-300 p-2 text-center'>
              {programmingStats.average.toFixed(2)}
            </td>
            <td className='border border-gray-300 p-2 text-center'>
              {fitnessStats.average.toFixed(2)}
            </td>
            <td className='border border-gray-300 p-2 text-center'>
              {workStats.average.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>

      {modalMessage && (
        <ResponseModal
          onConfirm={closeModal} // Close the modal on "Ok"
          title={modalTitle} // Pass the title (Success/Error)
          message={modalMessage} // Pass the success or error message
        />
      )}
    </div>
  )
}

Calendar.propTypes = {
  month: PropTypes.string.isRequired,
  year: PropTypes.string.isRequired,
}
