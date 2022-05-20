import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { urqlClient, searchProfiles, recommendProfiles, getPublications } from '../api'
import Link from 'next/link'

import LensHub from '../abi.json'

const contractAddress = "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d"

export default function Home() {
  const [connected, setConnected] = useState()
  const [profiles, setProfiles] = useState([])
  const [searchString, setSearchString] = useState('')

  useEffect(() => {
    getRecommendedProfiles() 
    async function checkConnection() {
      const provider = new ethers.providers.Web3Provider(
        (window).ethereum
      )
      const addresses = await provider.listAccounts();
      if (addresses.length) {
        setConnected(true)
      }
    }
    checkConnection()
  }, [])

  async function getRecommendedProfiles() {
    const response = await urqlClient.query(recommendProfiles).toPromise()
    const profileData = await Promise.all(response.data.recommendedProfiles.map(async profile => {
      const pub = await urqlClient.query(getPublications, { id: profile.id, limit: 1 }).toPromise()
      profile.publication = pub.data.publications.items[0]
      profile.backgroundColor = generateRandomColor()
      return profile
    }))
    console.log('profileData: ', profileData)
    setProfiles(profileData)
    console.log('Lens example data: ', response)
  }

  async function connect() {
    await window.ethereum.enable()
    setConnected(true)
  }

  async function searchForProfile() {
    console.log('searchString: ', searchString)
    const response = await urqlClient.query(searchProfiles, {
      profileName: searchString
    }).toPromise()
    console.log('response: ', response)
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

  async function followUser() {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, LensHub, signer)

    const data = await contract.getProfileIdByHandle(profile)
    const profileId = data.toString()

    await contract.follow([profileId], [0x0])
  }
  
  console.log('profiles:', profiles)

  return (
    <div style={containerStyle}>
      <input
        placeholder='Search'
        onChange={e => setSearchString(e.target.value)}
        value={searchString}
        style={inputStyle}
      />
      <button style={buttonStyle} onClick={searchForProfile}>Search Lens</button>
      {
        !connected && (
            <button style={buttonStyle} onClick={connect}>Connect Wallet</button>
        )
      }
      <div style={listItemContainerStyle}>
        {
          profiles.map((profile, index) => (
            <Link href={`/profile/${profile.id}`} key={index}>
              <a>
                <div style={listItemStyle}>
                  <div style={profileContainerStyle} >
                    {
                      profile.picture ? (
                      <img src={profile.picture.original.url} style={profileImageStyle} />
                      ) : (
                        <div
                          style={{
                            ...placeholderStyle,
                            backgroundColor: profile.backgroundColor
                          }}
                        />
                      )
                    }
                    
                    <div style={profileInfoStyle}>
                      <h3 style={nameStyle}>{profile.name}</h3>
                      <p style={handleStyle}>{profile.handle}</p>
                    </div>
                  </div>
                  <div>
                    <p style={latestPostStyle}>{profile.publication?.metadata.content}</p>
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

const latestPostStyle = {
  margin: '8px 0px 10px'
}

const profileContainerStyle = {
  display: 'flex',
  flexDirection: 'row',
}

const profileImageStyle = {
  width: '42px',
  height: '42px',
  borderRadius: '34px',
}

const placeholderStyle = {
  ...profileImageStyle,
}

const containerStyle = {
  width: '900px',
  margin: '0 auto',
  padding: '50px 0px'
}

const listItemContainerStyle = {
  display: 'flex',
  flexDirection: 'column'
}

const listItemStyle = {
  backgroundColor: 'white',
  marginTop: '13px',
  borderRadius: '7px',
  border: '1px solid rgba(0, 0, 0, .15)',
  padding: '19px 15px'
}

const profileInfoStyle = {
  marginLeft: '10px'
}

const nameStyle = {
  margin: '0 0px 5px'
}

const handleStyle = {
  margin: '0px 0px 5px',
  color: '#b900c9'
}

const inputStyle = {
  outline: 'none',
  border: 'none',
  padding: '12px 15px',
  fontSize: '14px',
  borderRadius: '7px',
  border: '1px solid rgba(0, 0, 0, .1)'
}

const buttonStyle = {
  border: 'none',
  outline: 'none',
  marginLeft: '8px',
  backgroundColor: 'black',
  color: 'white',
  padding: '10px 27px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold'
}