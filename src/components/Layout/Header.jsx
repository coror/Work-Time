import logoImg from '../../assets/logo.jpg'
import classes from './Header.module.css'

export default function Header() {
  return (
    <header className={classes['main-header']}>
      <div className={classes.title}>
        <img src={logoImg} alt='A restaurant' />
        <h1 className={classes.h1}>Work Time</h1>
      </div>
    </header>
  )
}
