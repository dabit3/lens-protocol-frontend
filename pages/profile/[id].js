import { useRouter } from 'next/router'
import { useState, useEffect, useContext } from 'react'
import {
  createClient,
  getPublications,
  getProfiles,
  doesFollow as doesFollowQuery,
  createUnfollowTypedData
} from '../../api'
import { ethers } from 'ethers'
import { css } from '@emotion/css'
import { AppContext } from '../../context'
import { getSigner, generateRandomColor } from '../../utils'

import ABI from '../../abi'
const LENS_HUB_CONTRACT_ADDRESS = "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d"

export default function Profile() {
  const [profile, setProfile] = useState()
  const [publications, setPublications] = useState([])
  const [doesFollow, setDoesFollow] = useState()
  const [loadedState, setLoadedState] = useState('')
  const router = useRouter()
  const context = useContext(AppContext)
  const { id } = router.query
  const { userAddress } = context

  useEffect(() => {
    if (id) {
      fetchProfile()
    }
    if (id && userAddress) {
      checkDoesFollow()
    }
  }, [id, userAddress])

  async function unfollow() {
    try {
      const client = await createClient()
      const response = await client.mutation(createUnfollowTypedData, {
        request: { profile: id }
      }).toPromise()
      const typedData = response.data.createUnfollowTypedData.typedData
      const contract = new ethers.Contract(
        typedData.domain.verifyingContract,
        ABI,
        getSigner()
      )

      const tx = await contract.burn(typedData.value.tokenId)
      setTimeout(() => {
        setDoesFollow(false)
      }, 2500)
      await tx.wait()
      console.log(`successfully unfollowed ... ${profile.handle}`)
      } catch (err) {
        console.log('error:', err)
      }
  }

  async function fetchProfile() {
    try {
      const urqlClient = await createClient()
      const returnedProfile = await urqlClient.query(getProfiles, { id }).toPromise();
      const profileData = returnedProfile.data.profiles.items[0]
      profileData.color = generateRandomColor()
      setProfile(profileData)

      const pubs = await urqlClient.query(getPublications, { id, limit: 50 }).toPromise()

      setPublications(pubs.data.publications.items)
      setLoadedState('loaded')
    } catch (err) {
      console.log('error fetching profile...', err)
    }
  }

  async function checkDoesFollow() {
    const urqlClient = await createClient()
    const response = await urqlClient.query(
      doesFollowQuery,
      {
        request: {
          followInfos: [{
            followerAddress: userAddress,
            profileId: id
          }]
        }
      }
    ).toPromise()
    setDoesFollow(response.data.doesFollow[0].follows)
  }

  async function followUser() {
    const contract = new ethers.Contract(
      LENS_HUB_CONTRACT_ADDRESS,
      ABI,
      getSigner()
    )

    try {
      const tx = await contract.follow([id], [0x0])
      setTimeout(() => {
        setDoesFollow(true)
      }, 2500)
      await tx.wait()
      console.log(`successfully followed ... ${profile.handle}`)
    } catch (err) {
      console.log('error: ', err)
    }
  }

  if (!profile) return null

  return (
    <div className={containerStyle}>
      <div
        className={css`
          ${headerStyle};
          background-image: url(${profile.coverPicture?.original.url});
          background-color: ${profile.color};
        `}
      >
      </div>
      <div className={columnWrapperStyle}>
        <div>
          <img className={
            css`
              ${profileImageStyle};
              background-color: profile.color;
            `
          } src={profile.picture?.original?.url} />
          <h3 className={nameStyle}>{profile.name}</h3>
          <p className={handleStyle}>{profile.handle}</p>
          <div>
            {
              userAddress ? (
                doesFollow ? (
                  <button
                   onClick={unfollow}
                   className={buttonStyle}
                 >Unfollow</button>
                ) : (
                  <button
                    onClick={followUser}
                    className={buttonStyle}
                  >Follow</button>
                )
              ) : null
            }
          </div>
        </div>
        <div className={rightColumnStyle}>
          <h3 className={postHeaderStyle}>Posts</h3>
          {
            publications.map((pub, index) => (
              <div className={publicationWrapper} key={index}>
                <p className={publicationContentStyle}>{pub.metadata.content}</p>
              </div>
            ))
          }
          {
            loadedState === 'loaded' && !publications.length && (
              <div className={emptyPostContainerStyle}>
                <p className={emptyPostTextStyle}>
                  <span className={emptyPostHandleStyle}>{profile.handle}</span> has not posted yet!
                </p>
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}

const emptyPostTextStyle = css`
  text-align: center;
  margin: 0;
`

const emptyPostContainerStyle = css`
  background-color: white;
  border: 1px solid rgba(0, 0, 0, .15);
  padding: 25px;
  border-radius: 8px;
`

const emptyPostHandleStyle = css`
  font-weight: 600;
`

const postHeaderStyle = css`
  margin: 0px 0px 15px;
`

const publicationWrapper = css`
  background-color: white;
  margin-bottom: 15px;
  padding: 5px 25px;
  border-radius: 15px;
  border: 1px solid #ededed;
`

const publicationContentStyle = css`
  line-height: 26px;
`

const nameStyle = css`
  margin: 15px 0px 5px;
`

const handleStyle = css`
  margin: 0px 0px 5px;
  color: #b900c9;
`

const headerStyle = css`
  width: 900px;
  max-height: 300px;
  height: 300px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
`

const profileImageStyle = css`
  width: 200px;
  height: 200px;
  max-width: 200px;
  border: 10px solid white;
  border-radius: 12px;
`

const columnWrapperStyle = css`
  margin-top: 20px;
  display: flex;
  flex-direction: row;
`

const rightColumnStyle = css`
  margin-left: 20px;
  flex: 1;
`

const containerStyle = css`
  width: 900px;
  margin: 0 auto;
  padding: 50px 0px;
`

const buttonStyle = css`
  border: 2px solid rgb(249, 92, 255);
  outline: none;
  margin-top: 15px;
  color: rgb(249, 92, 255);
  padding: 13px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all .35s;
  font-weight: 700;
  width: 100%;
  letter-spacing: .75px;
  &:hover {
    background-color: rgb(249, 92, 255);
    color: white;
  }
`