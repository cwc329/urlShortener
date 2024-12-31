import { Link } from 'react-router-dom'
import { useConfig } from '../auth'
import ProviderList from '../socialaccount/ProviderList'

export default function Signup() {
  const config = useConfig()
  const hasProviders = config.data.socialaccount?.providers?.length > 0

  return (
    <div>
      <h1>Sign Up</h1>
      <p>
        Already have an account? <Link to='/account/login'>Login here.</Link>
      </p>

      {hasProviders
        ? <>
          <h2>Or use a third-party</h2>
          <ProviderList callbackURL='/account/provider/callback' />
        </>
        : null}
    </div>
  )
}
