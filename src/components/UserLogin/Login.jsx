import { useState } from 'react'
import Parse from 'parse'
import classes from './Login.module.css'
import Button from '../UI/Button'
import PropTypes from 'prop-types'
import PasswordResetEmail from '../UpdateUser/PasswordResetEmail'
import Footer from '../Layout/Footer'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [showPasswordResetEmail, setShowPasswordResetEmail] = useState(false)
  const [loginAttempted, setLoginAttempted] = useState(false)

  const handleLogin = async (event) => {
    event.preventDefault()
    setIsLoggingIn(true)

    try {
      const user = await Parse.User.logIn(email, password)
      const sessionToken = user.getSessionToken()
      onLogin(sessionToken)
      localStorage.setItem('sessionToken', sessionToken)
      setLoginError('')
      setLoginAttempted(false)
      console.log('logged in', user)
    } catch (error) {
      setLoginError('Invalid email or password')
      setLoginAttempted(true)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleInputChange = (event) => {
    setLoginError('')
    setLoginAttempted(false)
    const { name, value } = event.target

    if (name === 'email') {
      setEmail(value)
    } else if (name === 'password') {
      setPassword(value)
    }
  }

  let inputClassName = ''

  if (loginAttempted && loginError) {
    inputClassName = classes['login-error']
  }

  const togglePasswordResetEmail = () => {
    setShowPasswordResetEmail(!showPasswordResetEmail)
  }

  // Function to handle keyboard events (Enter or Space)
  const handleForgotPasswordKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      togglePasswordResetEmail()
    }
  }

  return (
    <div>
      <div className={classes['login-container']}>
        {showPasswordResetEmail ? (
          <PasswordResetEmail
            togglePasswordResetEmail={togglePasswordResetEmail}
          />
        ) : (
          <form className={classes['login-form']} onSubmit={handleLogin}>
            <div>
              <label htmlFor='email'>Email:</label>
              <input
                type='email'
                name='email'
                value={email}
                onChange={handleInputChange}
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor='password'>Password:</label>
              <input
                type='password'
                name='password'
                value={password}
                onChange={handleInputChange}
                className={inputClassName}
              />
            </div>
            <div>
              {loginError && (
                <p className={`${classes['error']} ${classes['login-error']}`}>
                  {loginError}
                </p>
              )}
            </div>
            <div>
              <span
                className={`${classes['forgot-link']} ${classes['link']}`}
                onClick={togglePasswordResetEmail}
                onKeyDown={handleForgotPasswordKeyDown} // Add keyboard support
                role='button' // Adding role to make it interactive
                tabIndex='0' // Make the element focusable
                aria-label='Forgot your password?' // Provide additional context for screen readers
              >
                Forgot your password?
              </span>
            </div>
            <div>
              <Button
                type='submit'
                disabled={isLoggingIn}
                className={classes.button}
              >
                {isLoggingIn ? (
                  <span className={classes['loading-spinner']}></span>
                ) : (
                  'LOGIN'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
      <Footer />
    </div>
  )
}

// Define PropTypes for Modal
Login.propTypes = {
  onLogin: PropTypes.func, // onClose should be a function and is required
}
