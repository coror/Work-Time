import classes from './Button.module.css'
import PropTypes from 'prop-types'

export default function Button({ children, onClick, type, disabled }) {
  return (
    <button
      className={classes.button}
      onClick={onClick}
      type={type || 'button'}
      disabled={disabled}
    >
      {disabled ? <span className={classes['lds-dual-ring']}></span> : children}
    </button>
  )
}

// Define PropTypes for Modal
Button.propTypes = {
  onClick: PropTypes.func, // onClose should be a function and is required
  children: PropTypes.node.isRequired, // children can be any renderable content and is required
  type: PropTypes.string, // type should be a string (optional)
  disabled: PropTypes.bool, // disabled should be a boolean (optional)
}
