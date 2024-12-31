import { getCSRFToken } from './django'

const Client = Object.freeze({
  APP: 'app',
  BROWSER: 'browser'
})

const CLIENT = Client.BROWSER

const BASE_URL = `/_allauth/${CLIENT}/v1`
const ACCEPT_JSON = {
  accept: 'application/json'
}

export const AuthProcess = Object.freeze({
  LOGIN: 'login',
  CONNECT: 'connect'
})

export const Flows = Object.freeze({
  VERIFY_EMAIL: 'verify_email',
  LOGIN: 'login',
  LOGIN_BY_CODE: 'login_by_code',
  SIGNUP: 'signup',
  PROVIDER_REDIRECT: 'provider_redirect',
  PROVIDER_SIGNUP: 'provider_signup',
  MFA_AUTHENTICATE: 'mfa_authenticate',
  REAUTHENTICATE: 'reauthenticate',
  MFA_REAUTHENTICATE: 'mfa_reauthenticate',
  MFA_WEBAUTHN_SIGNUP: 'mfa_signup_webauthn'
})

export const URLs = Object.freeze({
  // Meta
  CONFIG: BASE_URL + '/config',

  // Account management
  EMAIL: BASE_URL + '/account/email',
  PROVIDERS: BASE_URL + '/account/providers',

  // Auth: Basics
  LOGIN: BASE_URL + '/auth/login',
  REQUEST_LOGIN_CODE: BASE_URL + '/auth/code/request',
  CONFIRM_LOGIN_CODE: BASE_URL + '/auth/code/confirm',
  SESSION: BASE_URL + '/auth/session',
  SIGNUP: BASE_URL + '/auth/signup',

  // Auth: Social
  PROVIDER_SIGNUP: BASE_URL + '/auth/provider/signup',
  REDIRECT_TO_PROVIDER: BASE_URL + '/auth/provider/redirect',
  PROVIDER_TOKEN: BASE_URL + '/auth/provider/token',

  // Auth: Sessions
  SESSIONS: BASE_URL + '/auth/sessions',
})

export const AuthenticatorType = Object.freeze({
  TOTP: 'totp',
  RECOVERY_CODES: 'recovery_codes',
  WEBAUTHN: 'webauthn'
})

function postForm(action, data) {
  const f = document.createElement('form')
  f.method = 'POST'
  f.action = action

  for (const key in data) {
    const d = document.createElement('input')
    d.type = 'hidden'
    d.name = key
    d.value = data[key]
    f.appendChild(d)
  }
  document.body.appendChild(f)
  f.submit()
}

const tokenStorage = window.sessionStorage

async function request(method, path, data, headers) {
  const options = {
    method,
    headers: {
      ...ACCEPT_JSON,
      ...headers
    }
  }
  // Don't pass along authentication related headers to the config endpoint.
  if (path !== URLs.CONFIG) {
    if (CLIENT === Client.BROWSER) {
      options.withCredentials = true
      options.headers['X-CSRFToken'] = getCSRFToken()
    } else if (CLIENT === Client.APP) {
      // IMPORTANT!: Do NOT use `Client.APP` in a browser context, as you will
      // be vulnerable to CSRF attacks. This logic is only here for
      // development/demonstration/testing purposes...
      options.headers['User-Agent'] = 'django-allauth example app'
      const sessionToken = tokenStorage.getItem('sessionToken')
      if (sessionToken) {
        options.headers['X-Session-Token'] = sessionToken
      }
    }
  }

  if (typeof data !== 'undefined') {
    options.body = JSON.stringify(data)
    options.headers['Content-Type'] = 'application/json'
  }
  const resp = await fetch(path, options)
  const msg = await resp.json()
  if (msg.status === 410) {
    tokenStorage.removeItem('sessionToken')
  }
  if (msg.meta?.session_token) {
    tokenStorage.setItem('sessionToken', msg.meta.session_token)
  }
  if ([401, 410].includes(msg.status) || (msg.status === 200 && msg.meta?.is_authenticated)) {
    const event = new CustomEvent('allauth.auth.change', { detail: msg })
    document.dispatchEvent(event)
  }
  return msg
}

export async function login(data) {
  return await request('POST', URLs.LOGIN, data)
}

export async function logout() {
  return await request('DELETE', URLs.SESSION)
}

export async function signUp(data) {
  return await request('POST', URLs.SIGNUP, data)
}

export async function providerSignup(data) {
  return await request('POST', URLs.PROVIDER_SIGNUP, data)
}

export async function getProviderAccounts() {
  return await request('GET', URLs.PROVIDERS)
}

export async function disconnectProviderAccount(providerId, accountUid) {
  return await request('DELETE', URLs.PROVIDERS, { provider: providerId, account: accountUid })
}

export async function requestLoginCode(email) {
  return await request('POST', URLs.REQUEST_LOGIN_CODE, { email })
}

export async function confirmLoginCode(code) {
  return await request('POST', URLs.CONFIRM_LOGIN_CODE, { code })
}

export async function getEmailAddresses() {
  return await request('GET', URLs.EMAIL)
}
export async function getSessions() {
  return await request('GET', URLs.SESSIONS)
}

export async function endSessions(ids) {
  return await request('DELETE', URLs.SESSIONS, { sessions: ids })
}

export async function getConfig() {
  return await request('GET', URLs.CONFIG)
}

export async function addEmail(email) {
  return await request('POST', URLs.EMAIL, { email })
}

export async function deleteEmail(email) {
  return await request('DELETE', URLs.EMAIL, { email })
}

export async function markEmailAsPrimary(email) {
  return await request('PATCH', URLs.EMAIL, { email, primary: true })
}

export async function requestEmailVerification(email) {
  return await request('PUT', URLs.EMAIL, { email })
}

export async function getAuth() {
  return await request('GET', URLs.SESSION)
}

export async function authenticateByToken(providerId, token, process = AuthProcess.LOGIN) {
  return await request('POST', URLs.PROVIDER_TOKEN, {
    provider: providerId,
    token,
    process
  }
  )
}

export function redirectToProvider(providerId, callbackURL, process = AuthProcess.LOGIN) {
  postForm(URLs.REDIRECT_TO_PROVIDER, {
    provider: providerId,
    process,
    callback_url: callbackURL,
    csrfmiddlewaretoken: getCSRFToken(),
  })
}

