import { createClient as createUrqlClient } from 'urql'
import { refreshAuthToken } from '../utils'

export const APIURL = "https://api.lens.dev"
export const STORAGE_KEY = "LH_STORAGE_KEY"

export const basicClient = new createUrqlClient({
  url: APIURL
})

export async function createClient() {
  const storageData = JSON.parse(localStorage.getItem(STORAGE_KEY))
  if (storageData) {
    try {
      const { accessToken } = await refreshAuthToken()
      const urqlClient = new createUrqlClient({
        url: APIURL,
        fetchOptions: {
          headers: {
            'x-access-token': `Bearer ${accessToken}`
          },
        },
      })
      return urqlClient
    } catch (err) {
      return basicClient
    }
  } else {
    return basicClient
  }
}

export {
  recommendProfiles,
  getProfiles,
  getPublications,
  searchProfiles,
  searchPublications,
  explorePublications,
  doesFollow,
  getChallenge
} from './queries'

export {
  followUser,
  authenticate,
  refresh,
  createUnfollowTypedData,
  broadcast
} from './mutations'