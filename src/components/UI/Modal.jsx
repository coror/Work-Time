import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import classes from './Modal.module.css'

function Backdrop({ onClose }) {
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' || event.key === ' ') onClose()
  }

  return (
    <div
      className={classes.backdrop}
      onClick={onClose}
      onKeyDown={handleKeyPress}
      role='button'
      tabIndex={0}
    ></div>
  )
}

function ModalOverlay({ children }) {
  return <div className={classes.modal}>{children}</div>
}

export default function Modal({ onClose, children }) {
  return (
    <>
      {ReactDOM.createPortal(
        <Backdrop onClose={onClose} />,
        document.getElementById('overlays'),
      )}
      {ReactDOM.createPortal(
        <ModalOverlay>{children}</ModalOverlay>,
        document.getElementById('overlays'),
      )}
    </>
  )
}

Backdrop.propTypes = {
  onClose: PropTypes.func.isRequired,
}

ModalOverlay.propTypes = {
  children: PropTypes.node.isRequired,
}

// Define PropTypes for Modal
Modal.propTypes = {
  onClose: PropTypes.func.isRequired, // onClose should be a function and is required
  children: PropTypes.node.isRequired, // children can be any renderable content and is required
}
