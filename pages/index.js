import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { urqlClient, searchPublications, recommendProfiles, explorePublications, getPublications } from '../api'
import { css } from '@emotion/css'
import { trimString } from '../utils'
import Link from 'next/link'

import LensHub from '../abi.json'

const contractAddress = "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d"

export default function Home() {
  const [connected, setConnected] = useState(true)
  const [profiles, setProfiles] = useState([])
  const [posts, setPosts] = useState([])
  const [searchString, setSearchString] = useState('')

  useEffect(() => {
    fetchPosts() 
    async function checkConnection() {
      const provider = new ethers.providers.Web3Provider(
        (window).ethereum
      )
      const addresses = await provider.listAccounts();
      if (addresses.length) {
        setConnected(true)
      } else {
        setConnected(false)
      }
    }
    checkConnection()
  }, [])

  async function fetchPosts() {
    try {
      const response = await urqlClient.query(explorePublications).toPromise()
      console.log('dataresponse: ', response)
      const posts = response.data.explorePublications.items.map(post => {
        post.backgroundColor = generateRandomColor()
        return post
      })
      setPosts(posts)
    } catch (error) {
      console.log({ error })
    }
  }

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
      console.log('Lens example data: ', response)
    } catch (err) {
      console.log('error fetching recommended profiles: ', err)
    }
  }

  async function connect() {
    await window.ethereum.enable()
    setConnected(true)
  }

  async function searchForPost() {
    try {
      const response = await urqlClient.query(searchPublications, {
        query: searchString, type: 'PUBLICATION'
      }).toPromise()
      console.log('response:', response)
      const postData = await response.data.search.items.map(post => {
        post.backgroundColor = generateRandomColor()
        return post
      })
  
      console.log('postData: ', postData)
      setPosts(postData)
    } catch (error) {
      console.log({ error })
    }
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
    <div className={containerStyle}>
      <div className={searchContainerStyle}>
        <input
          placeholder='Search'
          onChange={e => setSearchString(e.target.value)}
          value={searchString}
          className={inputStyle}
        />
        <button className={buttonStyle} onClick={searchForPost}>Search Posts</button>
        {
          !connected && (
              <button className={buttonStyle} onClick={connect}>Connect Wallet</button>
          )
        }
      </div>
      <div className={listItemContainerStyle}>
        {
          posts.map((post, index) => (
            <Link href={`/profile/${post.profile.id}`} key={index}>
              <a>
                <div className={listItemStyle}>
                  <div className={profileContainerStyle} >
                    {
                      post.profile.picture && post.profile.picture.original ? (
                      <img src={post.profile.picture.original.url} className={profileImageStyle} />
                      ) : (
                        <div
                          className={
                            css`
                            ${placeholderStyle};
                            background-color: ${post.backgroundColor};
                            `
                          }
                        />
                      )
                    }
                    
                    <div className={profileInfoStyle}>
                      <h3 className={nameStyle}>{post.profile.name}</h3>
                      <p className={handleStyle}>{post.profile.handle}</p>
                    </div>
                  </div>
                  <div>
                    <p className={latestPostStyle}>{trimString(post.metadata.content, 200)}</p>
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

const searchContainerStyle = css`
  padding: 40px 0px 30px;
`

const latestPostStyle = css`
  margin: 8px 0px 10px;
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
  border-radius: 7px;
  border: 1px solid rgba(0, 0, 0, .15);
  padding: 19px 15px;
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
  padding: 12px 15px;
  font-size: 14px;
  border-radius: 7px;
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
  color: white;
  padding: 13px 33px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  background: linear-gradient(to right, #8f34eb 0%, #b100b8 61%);
  transition: all .55s;
  width: 200px;
  &:hover {
    box-shadow: 0px 0px 10px 1px rgba(245, 0, 255, .5);
  }
`