import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { urqlClient, getPublications, getProfiles } from '../../api'
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

  if (!profile) return null

  return (
    <div className={containerStyle}>
      <div
        className={{
          ...headerStyle,
          backgroundImage: `url(${profile.coverPicture?.original.url})`,
          backgroundColor: profile.color
        }}
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
        </div>
        <div className={rightColumnStyle}>
          <h3 className={postHeaderStyle}>Posts</h3>
          {
            publications.map((pub, index) => (
              <div className={publicationWrapper} key={index}>
                <p>{pub.metadata.content}</p>
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
  padding: 10px 20px;
  border-radius: 15px;
  border: 1px solid #ededed;
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