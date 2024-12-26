import { Suspense, useState, useEffect, lazy } from 'react'
import { Chart } from './components/Chart'
import { Calendar } from './components/Calendar'
import Parse from 'parse'
import Footer from './components/Layout/Footer'
import Header from './components/Layout/Header'
import Button from './components/UI/Button'
import classes from './App.module.css'
import { EventEmitter } from 'events'
import Modal from './components/UI/Modal' // Import the Modal
import NewUser from './components/NewUser/NewUser'
window.EventEmitter = EventEmitter

const Login = lazy(() => import('./components/UserLogin/Login'))

const PARSE_APPLICATION_ID = import.meta.env.VITE_REACT_APP_PARSE_APPLICATION_ID
const PARSE_HOST_URL = import.meta.env.VITE_REACT_APP_PARSE_HOST_URL
const PARSE_JAVASCRIPT_KEY = import.meta.env.VITE_REACT_APP_PARSE_JAVASCRIPT_KEY
Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY)
Parse.serverURL = PARSE_HOST_URL

const initialSessionToken = localStorage.getItem('sessionToken')

function App() {
  const [sessionToken, setSessionToken] = useState(initialSessionToken)
  const [showLogin, setShowLogin] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [totalHours, setTotalHours] = useState(0)
  const [userRole, setUserRole] = useState(null)
  const [showCreateNewUser, setShowCreateNewUser] = useState(false)

  const handleLogin = async (token) => {
    setSessionToken(token)

    try {
      const user = await Parse.User.current().fetch()
      const userRole = user.get('roleName')
      setUserRole(userRole)
      setShowLogin(false)
    } catch (error) {
      console.log('Error fetching user role', error)
    }
  }

  const handleLogout = () => {
    setSessionToken(null)
    setUserRole(null)
    setShowCreateNewUser(false)
    setShowLogin(true)
    localStorage.removeItem('sessionToken')
  }

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const user = await Parse.User.current().fetch()
        const userRole = user.get('roleName')
        setUserRole(userRole)
      } catch (error) {
        console.log(error)
      }
    }
    fetchUserRole()
  }, [])

  // Helper to get month name and year
  const getMonthYear = (date) => {
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
    return { month: months[date.getMonth()], year: date.getFullYear() }
  }

  // Handlers for navigation
  const goToPreviousMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    )
  }

  const goToNextMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    )
  }

  // Log the current year to ensure it's updating
  useEffect(() => {
    const { year } = getMonthYear(currentDate)
    console.log('Current year:', year)
  }, [currentDate])

  // Calculate total hours studied (from backend)
  const calculateTotalHoursStudied = async () => {
    try {
      // Get the current user
      const user = Parse.User.current()
      if (!user) {
        console.error('No logged-in user found.')
        return
      }

      let totalMinutes = 0

      // Query the StudyData class for the current user
      const query = new Parse.Query('StudyData')
      query.equalTo('user', {
        __type: 'Pointer',
        className: '_User',
        objectId: user.id, // Ensure the query matches the logged-in user
      })

      // Fetch all study data records for the user
      const results = await query.find()

      // Sum up the programming hours from the fetched results
      results.forEach((record) => {
        const programmingHours = record.get('programmingHours') || []
        const monthlyMinutes = programmingHours.reduce(
          (sum, value) => sum + (parseInt(value) || 0),
          0,
        )
        totalMinutes += monthlyMinutes
      })

      // Convert minutes to hours and set the state
      setTotalHours((totalMinutes / 60).toFixed(2))
    } catch (error) {
      console.error('Error fetching study data:', error)
    }
  }

  // Call the calculate function on page load
  useEffect(() => {
    calculateTotalHoursStudied()
  }, []) // Empty dependency array ensures this runs only once after component mounts
  // Get the month and year for the current date
  const { month, year } = getMonthYear(currentDate)

  if (!sessionToken) {
    return (
      <>
        <Header />
        {!sessionToken && showLogin && (
          <Suspense fallback={<p>Loading...</p>}>
            <Login onLogin={handleLogin} />
          </Suspense>
        )}
        <Footer />
      </>
    )
  }

  return (
    <div className='flex flex-col mx-auto  p-6 rounded-lg shadow-lg'>
      {/* Header Section */}
      <h3 className='text-3xl font-semibold text-center text-gray-800 mb-4'>
        StudyTime
      </h3>
      <p className='text-center text-lg text-gray-600 mb-6'>
        Total Hours Studied: {totalHours} hours
      </p>

      {/* Charts Section */}
      <div className='space-y-8'>
        <Chart
          name='Programming'
          dataKey='programming' // Pass programming data
        />
        <Chart
          name='Fitness'
          dataKey='fitness' // Pass fitness data
        />
      </div>

      {/* Calendar Section */}
      <div className='mt-8'>
        <div className='flex justify-evenly items-center -mb-9'>
          <button
            onClick={goToPreviousMonth}
            className='text-gray-600 hover:text-gray-800 font-semibold'
          >
            &lt; Previous
          </button>
          {/* <h3 className='text-xl font-bold text-gray-800'>
            {month.substring(0, 3)}
            {year}
          </h3> */}
          <button
            onClick={goToNextMonth}
            className='text-gray-600 hover:text-gray-800 font-semibold'
          >
            Next &gt;
          </button>
        </div>
        <Calendar month={month} year={year.toString()} />
      </div>
      <div className={classes['buttons-container']}>
        <Button onClick={handleLogout}>Logout</Button>
        {userRole === 'admin' && (
          <Button onClick={() => setShowCreateNewUser((prev) => !prev)}>
            {showCreateNewUser ? 'Close New User Form' : 'New User'}
          </Button>
        )}
      </div>

      {userRole === 'admin' && showCreateNewUser && (
        <Modal onClose={() => setShowCreateNewUser(false)}>
          <NewUser />
        </Modal>
      )}
    </div>
  )
}

export default App
