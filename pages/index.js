import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { searchPublications, explorePublications } from '../api/queries'
import { urqlClient } from '../api'
import { css, keyframes } from '@emotion/css'
import { trimString } from '../utils'
import Link from 'next/link'

import LensHub from '../abi.json'

const contractAddress = "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d"

export default function Home() {
  const [posts, setPosts] = useState([])
  const [loadingState, setLoadingState] = useState('loading')
  const [searchString, setSearchString] = useState('')

  useEffect(() => {
    fetchPosts() 
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
      setLoadingState('loaded')
    } catch (error) {
      console.log({ error })
    }
  }

  async function searchForPost() {
    setLoadingState('')
    try {
      const response = await urqlClient.query(searchPublications, {
        query: searchString, type: 'PUBLICATION'
      }).toPromise()
      console.log('response:', response)
      const postData = response.data.search.items.map(post => {
        post.backgroundColor = generateRandomColor()
        return post
      })
  
      console.log('postData: ', postData)
      setPosts(postData)
      if (!postData.length) {
        setLoadingState('no-results')
      }
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
  
  return (
    <div className={containerStyle}>
      <div className={searchContainerStyle}>
        <input
          placeholder='Search'
          onChange={e => setSearchString(e.target.value)}
          value={searchString}
          className={inputStyle}
        />
        <button className={buttonStyle} onClick={searchForPost}>SEARCH POSTS</button>
      </div>
      <div className={listItemContainerStyle}>
        {
          loadingState === 'no-results' && (
            <h2>No results....</h2>
          )
        }
        {
           loadingState === 'loading' && [0,1,2,3].map((n, index) => (
            <div
              className={grayLoadingStyle}
              key={index}
            />
          ))
        }
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