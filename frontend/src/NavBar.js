import { useUser, useConfig } from './auth'
import { useLocation, Link } from 'react-router-dom'

function NavBarItem(props) {
  const location = useLocation()
  const isActive = (props.href && location.pathname.startsWith(props.href)) || (props.to && location.pathname.startsWith(props.to))
  const cls = isActive ? 'nav-link active' : 'nav-link'
  return (
    <li className='nav-item'>
      {props.href
        ? <a className={cls} href={props.href}>{props.icon} {props.name}</a>
        : <Link className={cls} to={props.to}>{props.icon} {props.name}</Link>}
    </li>
  )
}

export default function NavBar() {
  const user = useUser()
  const config = useConfig()
  const anonNav = (
    <>
      <NavBarItem to='/account/login' icon='🔑' name='Login' />
      <NavBarItem to='/account/signup' icon='🧑' name='Signup' />
    </>
  )
  const authNav = (
    <>
      {config.data.socialaccount
        ? <NavBarItem to='/account/providers' icon='👤' name='Providers' />
        : null}
      <NavBarItem to='/account/logout' icon='👋' name='Logout' />
    </>
  )
  return (
    <nav className='navbar navbar-expand-md navbar-dark fixed-top bg-dark'>
      <div className='container-fluid'>
        <Link to='/' className='navbar-brand'>URL shortener</Link>
        <button className='navbar-toggler' type='button' data-bs-toggle='collapse' data-bs-target='#navbarCollapse' aria-controls='navbarCollapse' aria-expanded='false' aria-label='Toggle navigation'>
          <span className='navbar-toggler-icon' />
        </button>
        <div className='collapse navbar-collapse' id='navbarCollapse'>
          <ul className='navbar-nav me-auto mb-2 mb-md-0'>
            <NavBarItem to='/dashboard' icon='📈' name='Dashboard' />
            {window.DEVELOPMENT ? <NavBarItem href='http://localhost:1080' icon='✉️' name='MailCatcher' /> : null}
            {user ? authNav : anonNav}
          </ul>
        </div>
      </div>
    </nav>
  )
}
