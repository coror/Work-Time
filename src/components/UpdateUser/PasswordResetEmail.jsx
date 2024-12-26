import { useState } from 'react'
import styles from './PasswordResetEmail.module.css' // Import the CSS module
import Button from '../UI/Button'
import ResponseModal from '../UI/ResponseModal'
import PropTypes from 'prop-types'

const PasswordResetEmail = ({ togglePasswordResetEmail }) => {
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')

  const handleEmailChange = (event) => {
    setEmail(event.target.value)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      // Make an API request to your backend to request a password reset
      const response = await fetch(
        'https://parseapi.back4app.com/functions/requestPasswordResetEmail',
        {
          method: 'POST',
          headers: {
            'X-Parse-Application-Id': import.meta.env
              .VITE_REACT_APP_PARSE_APPLICATION_ID,
            'X-Parse-REST-API-Key': import.meta.env
              .VITE_REACT_APP_PARSE_REST_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
          }),
        },
      )

      const responseData = await response.json()

      console.log('Response Data:', responseData)
      console.log('Response:', response)

      if (responseData.result.success) {
        setEmailSent(true)
        setModalTitle('Success')
        setModalMessage(
          'Email sent. Check your inbox for further instructions.',
        )
      } else if (responseData.result.message) {
        setModalTitle('Error')
        setModalMessage(responseData.result.message) // Set error message from the backend
      } else {
        setModalTitle('Error')
        setModalMessage('An unknown error occurred.')
      }

      setIsModalOpen(true)
    } catch (error) {
      setModalTitle('Error')
      setModalMessage('An error occurred while sending the request.')
      setIsModalOpen(true)
    }
  }

  const handlerReturnToLogin = () => {
    togglePasswordResetEmail()
  }

  return (
    <div>
      {!emailSent ? (
        <form
          className={styles['password-reset-email-form']}
          onSubmit={handleSubmit}
        >
          <label htmlFor='email'>Enter your email:</label>
          <input
            type='email'
            value={email}
            onChange={handleEmailChange}
            required
          />
          <div className='flex flex-row items-center justify-center'>
            <Button type='submit'>Send Email</Button>
            <Button onClick={togglePasswordResetEmail}>Back to Login</Button>
          </div>
        </form>
      ) : (
        <Button onClick={handlerReturnToLogin}>Return to Login</Button>
      )}
      {isModalOpen && (
        <ResponseModal
          title={modalTitle}
          message={modalMessage}
          onConfirm={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}

export default PasswordResetEmail

PasswordResetEmail.propTypes = {
  togglePasswordResetEmail: PropTypes.func,
}
