import { Link } from 'react-router-dom'
import { useConfig } from '../auth'
import ProviderList from '../socialaccount/ProviderList'

export default function Login() {
  const config = useConfig()
  const hasProviders = config.data.socialaccount?.providers?.length > 0

  return (
    <div>
      <h1>Login</h1>
      <p>
        No account? <Link to='/account/signup'>Sign up here.</Link>
      </p>

      {config.data.account.login_by_code_enabled
        ? <Link className='btn btn-secondary' to='/account/login/code'>Mail me a sign-in code</Link>
        : null}
      {hasProviders
        ? <>
          <h2>Or use a third-party</h2>
          <ProviderList callbackURL='/account/provider/callback' />
        </>
        : null}
    </div>
  )
}
