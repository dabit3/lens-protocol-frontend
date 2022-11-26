import { createClient as createUrqlClient } from 'urql'
import { getProfiles, getPublications } from './queries'
import { createPostTypedData } from './mutations'
import { refreshAuthToken, generateRandomColor, signedTypeData } from '../utils'

export const APIURL = "https://api.lens.dev"
export const STORAGE_KEY = "LH_STORAGE_KEY"
export const LENS_HUB_CONTRACT_ADDRESS = "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d"
export const PERIPHERY_CONTRACT_ADDRESS = "0xeff187b4190E551FC25a7fA4dFC6cf7fDeF7194f"

export const basicClient = new createUrqlClient({
  url: APIURL
})

export async function fetchProfile(id) {
  try {
    const urqlClient = await createClient()
    const returnedProfile = await urqlClient.query(getProfiles, { id }).toPromise();
    const profileData = returnedProfile.data.profiles.items[0]
    profileData.color = generateRandomColor()
    const pubs = await urqlClient.query(getPublications, { id, limit: 50 }).toPromise()
    return {
      profile: profileData,
      publications: pubs.data.publications.items
    }
  } catch (err) {
    console.log('error fetching profile...', err)
  }
}

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

export async function createPostTypedDataMutation (request, token) {
  const { accessToken } = await refreshAuthToken()
  const urqlClient = new createUrqlClient({
    url: APIURL,
    fetchOptions: {
      headers: {
        'x-access-token': `Bearer ${accessToken}`
      },
    },
  })
  const result = await urqlClient.mutation(createPostTypedData, {
    request
  }).toPromise()

  return result.data.createPostTypedData
}

export const signCreatePostTypedData = async (request, token) => {
  const result = await createPostTypedDataMutation(request, token)
  const typedData = result.typedData
  const signature = await signedTypeData(typedData.domain, typedData.types, typedData.value);
  return { result, signature };
}

export {
  recommendProfiles,
  getProfiles,
  getDefaultProfile,
  getPublications,
  searchProfiles,
  searchPublications,
  explorePublications,
  doesFollow,
  getChallenge,
  timeline
} from './queries'

export {
  followUser,
  authenticate,
  refresh,
  createUnfollowTypedData,
  broadcast,
  createProfileMetadataTypedData,
  createPostTypedData
} from './mutations'