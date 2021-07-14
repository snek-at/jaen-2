import * as cms from './cms'

export {cms}

export type {default as CMSState} from './cms'

export type AuthState = {
  authenticated: boolean
  secret: string
  loading: boolean
}

export type NotifyState = {
  error: {
    message: string
    description: string
  } | null
}