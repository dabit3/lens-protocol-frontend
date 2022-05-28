import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { searchProfiles, recommendProfiles, getPublications } from '../api/queries'
import { urqlClient } from '../api'

import { css, keyframes } from '@emotion/css'
import { trimString } from '../utils'
import Link from 'next/link'

import LensHub from '../abi.json'

const contractAddress = "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d"

export default function Home() {
  const [profiles, setProfiles] = useState([])
  const [loadingState, setLoadingState] = useState('loading')
  const [searchString, setSearchString] = useState('')

  useEffect(() => {
    getRecommendedProfiles() 
  }, [])

  async function getRecommendedProfiles() {
    try {
      const response = await urqlClient.query(recommendProfiles).toPromise()
      console.log('response: ', response)
      const profileData = await Promise.all(response.data.recommendedProfiles.map(async profile => {
        const pub = await urqlClient.query(getPublications, { id: profile.id, limit: 1 }).toPromise()
        profile.publication = pub.data.publications.items[0]
        profile.backgroundColor = generateRandomColor()
        return profile
      }))
      console.log('profileData: ', profileData)
      setProfiles(profileData)
      setLoadingState('loaded')
      console.log('Lens example data: ', response)
    } catch (err) {
      console.log('error fetching recommended profiles: ', err)
    }
  }

  async function searchForProfile() {
    const response = await urqlClient.query(searchProfiles, {
      query: searchString, type: 'PROFILE'
    }).toPromise()
    const profileData = await Promise.all(response.data.search.items.map(async profile => {
      console.log('profile: ', profile)
      const pub = await urqlClient.query(getPublications, { id: profile.profileId, limit: 1 }).toPromise()
      profile.id = profile.profileId
      profile.backgroundColor = generateRandomColor()
      profile.publication = pub.data.publications.items[0]
      return profile
    }))

    console.log('profileData: ', profileData)
    setProfiles(profileData)
    console.log('Lens example data: ', response)

    console.log('response : ', response)
  }
  
  return (
    <div className={containerStyle}>
      <div className={searchContainerStyle}>
        <input
          placeholder='Search'
          onChange={e => setSearchString(e.target.value)}
          value={searchString}
          className={inputStyle}
        />
        <button className={buttonStyle} onClick={searchForProfile}>SEARCH PROFILES</button>
      </div>
      <div className={listItemContainerStyle}>
        {
           loadingState === 'loading' && [0,1,2,3].map((n, index) => (
            <div
              className={grayLoadingStyle}
              key={index}
            />
          ))
        }
        {
          profiles.map((profile, index) => (
            <Link href={`/profile/${profile.id}`} key={index}>
              <a>
                <div className={listItemStyle}>
                  <div className={profileContainerStyle} >
                    {
                      profile.picture && profile.picture.original ? (
                      <img src={profile.picture.original.url} className={profileImageStyle} />
                      ) : (
                        <div
                          className={
                            css`
                            ${placeholderStyle};
                            background-color: ${profile.backgroundColor};
                            `
                          }
                        />
                      )
                    }
                    
                    <div className={profileInfoStyle}>
                      <h3 className={nameStyle}>{profile.name}</h3>
                      <p className={handleStyle}>{profile.handle}</p>
                    </div>
                  </div>
                  <div>
                    <p className={latestPostStyle}>{trimString(profile.publication?.metadata.content, 200)}</p>
                  </div>
                </div>
              </a>
            </Link>
          ))
        }
      </div>
    </div>
  )
}

function generateRandomColor(){
  let maxVal = 0xFFFFFF;
  let randomNumber = Math.random() * maxVal; 
  randomNumber = Math.floor(randomNumber);
  randomNumber = randomNumber.toString(16);
  let randColor = randomNumber.padStart(6, 0);   
  return `#${randColor.toUpperCase()}`
}

const shimmer = keyframes`
from {
  opacity: .5;
}

50% {
  opacity: 1;
}

100% {
  opacity: .5;
}
`

const grayLoadingStyle = css`
  background-color: rgba(0, 0, 0, .075);
  height: 115px;
  width: 100%;
  margin-top: 13px;
  border-radius: 7px;
  animation: ${shimmer} 2s infinite linear;
`

const searchContainerStyle = css`
  padding: 40px 0px 30px;
`

const latestPostStyle = css`
  margin: 23px 0px 5px;
  word-wrap: break-word;
`

const profileContainerStyle = css`
  display: flex;
  flex-direction: row;
`

const profileImageStyle = css`
  width: 42px;
  height: 42px;
  border-radius: 34px;
`

const placeholderStyle = css`
  ${profileImageStyle};
`

const containerStyle = css`
  width: 900px;
  margin: 0 auto;
  padding: 0px 0px 50px;
`

const listItemContainerStyle = css`
  display: flex;
  flex-direction: column;
`

const listItemStyle = css`
  background-color: white;
  margin-top: 13px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, .15);
  padding: 21px;
`

const profileInfoStyle = css`
  margin-left: 10px;
`

const nameStyle = css`
  margin: 0 0px 5px;
`

const handleStyle = css`
  margin: 0px 0px 5px;
  color: #b900c9;
`

const inputStyle = css`
  outline: none;
  border: none;
  padding: 15px 20px;
  font-size: 16px;
  border-radius: 25px;
  border: 2px solid rgba(0, 0, 0, .04);
  transition: all .4s;
  width: 300px;
  background-color: #fafafa;
  &:focus {
    background-color: white;
    border: 2px solid rgba(0, 0, 0, .1);
  }
`

const buttonStyle = css`
  border: none;
  outline: none;
  margin-left: 15px;
  background-color: black;
  color: #340036;
  padding: 17px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  background-color: rgb(249, 92, 255);
  transition: all .35s;
  width: 240px;
  letter-spacing: .75px;
  &:hover {
    background-color: rgba(249, 92, 255, .75);
  }
`