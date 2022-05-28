import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { getPublications, getProfiles } from '../../api/queries'
import { followUser as followUserMutation } from '../../api/mutations'
import { urqlClient } from '../../api'
import { css } from '@emotion/css'

export default function Profile() {
  const [profile, setProfile] = useState()
  const [publications, setPublications] = useState([])
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    if (id) {
      fetchProfile() 
    }
  }, [id])
  async function fetchProfile() {
    const returnedProfile = await urqlClient.query(getProfiles, { id }).toPromise();
    const profileData = returnedProfile.data.profiles.items[0]
    profileData.color = generateRandomColor()
    setProfile(profileData)
    console.log('returnedProfile: ', returnedProfile)
    const pubs = await urqlClient.query(getPublications, { id, limit: 50 }).toPromise()
    console.log('pubs: ', pubs)
    setPublications(pubs.data.publications.items)
  }

  async function followUser() {
    const followRequest = [{
      profile: "0x266b"
    }]
    try {
      const data = await urqlClient.mutation(followUserMutation, {
        request: followRequest
      }).toPromise()
      console.log('followed..', data)
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
            <button
              onClick={followUser}
              className={buttonStyle}
            >Follow</button>
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
        </div>
      </div>
    </div>
  )
}

function generateRandomColor(){
  let maxVal = 0xFFFFFF; // 16777215
  let randomNumber = Math.random() * maxVal; 
  randomNumber = Math.floor(randomNumber);
  randomNumber = randomNumber.toString(16);
  let randColor = randomNumber.padStart(6, 0);   
  return `#${randColor.toUpperCase()}`
}

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
  border: none;
  outline: none;
  margin-top: 15px;
  background-color: black;
  color: #340036;
  padding: 13px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  background-color: rgb(249, 92, 255);
  transition: all .35s;
  width: 100%;
  letter-spacing: .75px;
  &:hover {
    background-color: rgba(249, 92, 255, .75);
  }
`