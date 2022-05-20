import styles from '../styles/Home.module.css'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { urqlClient, getProfiles, recommendProfiles, getPublication } from '../api'
import { useConnect, useAccount } from 'wagmi'

import LensHub from '../abi.json'

const contractAddress = "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d"

const ipfsMeta = {
  name: '',
  description: '',
  image: '',
  animation_url: ''
}

export default function Home(props) {
  console.log('props: ', props)
  const [connected, setConnected] = useState()
  const [profiles, setProfiles] = useState([])
  const [profile, setProfile] = useState('')
  const [profileImage, setProfileImage] = useState('')
  const [meta, setMeta] = useState(ipfsMeta)
  const [pub, setPub] = useState()

  const { activeConnector, isConnecting } = useConnect()
  const {isLoading } = useAccount()

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
      const pub = await urqlClient.query(getPublication, { id: profile.id}).toPromise()
      profile.publication = pub.data.publications.items[0]
      return profile
    }))

    console.log('profileData: ', profileData)
    setProfiles(profileData)
    console.log('Lens example data: ', response)

  }

  async function queryExample () {
    const response = await urqlClient.query(getProfiles, { id: '0x01' }).toPromise();
    console.log('Lens example data: ', response)
  }

  async function connect() {
    const addresses = await window.ethereum.enable()
    console.log('addresses: ', addresses)
    // return
    setConnected(true)
  }

  async function searchForProfile() {
    
  }

  async function followUser() {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, LensHub, signer)

    const data = await contract.getProfileIdByHandle(profile)
    const profileId = data.toString()

    await contract.follow([profileId], [0x0])
  }

  if (!connected) return (
    <div style={containerStyle}>
      <button style={buttonStyle} onClick={connect}>Connect Wallet</button>
    </div>
  )
  
  return (
    <div style={containerStyle}>
      <input
        placeholder='Search for profile'
        onChange={e => setProfile(e.target.value)}
        value={profile}
        style={inputStyle}
      />
      <button style={buttonStyle} onClick={searchForProfile}>Search For Profile</button>
      {
        profileImage && (
          <img src={profileImage} width="200" />
        )
      }
      {
        meta.name && (
          <div>
            <p>{meta.name}</p>
            <p>{meta.description}</p>
            <img src={meta.animation_url} width="200" />
          </div>  
        )
      }
      {
        pub && <p>{pub}</p>
      }
      <div style={listItemContainerStyle}>
        {
          profiles.map((profile, index) => (
            <div style={listItemStyle}>
              <div style={profileContainerStyle} key={index}>
                <img src={profile.picture?.original?.url} style={profileImageStyle} />
                <div style={profileInfoStyle}>
                  <h3 style={nameStyle}>{profile.name}</h3>
                  <p style={handleStyle}>{profile.handle}</p>
                </div>
              </div>
              <div>
                <h4>Latest post</h4>
                <p>{profile.publication.metadata.content}</p>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
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
  color: '#'
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