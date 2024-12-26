import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'

import Button from './Button'
import classes from './ResponseModal.module.css'

const BackDrop = ({ onConfirm }) => {
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' || event.key === ' ') onConfirm()
  }

  return (
    <div
      className={classes.backdrop}
      onClick={onConfirm}
      onKeyDown={handleKeyPress}
      role='button'
      tabIndex={0}
    ></div>
  )
}

const ModalOverlay = ({ title, message, onConfirm }) => {
  return (
    <div className={classes.modal}>
      <header className={classes.header}>
        <h2>{title}</h2>
      </header>
      <div className={classes.content}>
        <p>{message}</p>
      </div>
      <Button onClick={onConfirm}>Ok</Button>
    </div>
  )
}

export default function ResponseModal({ onConfirm, title, message }) {
  return (
    <>
      {ReactDOM.createPortal(
        <BackDrop onConfirm={onConfirm} />,
        document.getElementById('backdrop-root'),
      )}
      {ReactDOM.createPortal(
        <ModalOverlay title={title} message={message} onConfirm={onConfirm} />,
        document.getElementById('overlay-root'),
      )}
    </>
  )
}

BackDrop.propTypes = {
  onConfirm: PropTypes.func.isRequired,
}

ModalOverlay.propTypes = {
  children: PropTypes.node,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
}

// Define PropTypes for Modal
ResponseModal.propTypes = {
  onConfirm: PropTypes.func.isRequired, // onClose should be a function and is required
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
}
