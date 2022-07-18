import '../styles/globals.css'
import { useState, useEffect } from 'react'
import { ethers, providers } from 'ethers'
import { css } from '@emotion/css'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { createClient, STORAGE_KEY, authenticate as authenticateMutation, getChallenge, getDefaultProfile } from '../api'
import { parseJwt, refreshAuthToken } from '../utils'
import { AppContext } from '../context'
import Modal from '../components/CreatePostModal'

function MyApp({ Component, pageProps }) {
  const [connected, setConnected] = useState(true)
  const [userAddress, setUserAddress] = useState()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userProfile, setUserProfile] = useState()
  const router = useRouter()

  useEffect(() => {
    refreshAuthToken()
    async function checkConnection() {
      const provider = new ethers.providers.Web3Provider(
        (window).ethereum
      )
      const addresses = await provider.listAccounts();
      if (addresses.length) {
        setConnected(true)
        setUserAddress(addresses[0])
        getUserProfile(addresses[0])
      } else {
        setConnected(false)
      }
    }
    checkConnection()
    listenForRouteChangeEvents()
  }, [])

  async function getUserProfile(address) {
    try {
      const urqlClient = await createClient()
      const response = await urqlClient.query(getDefaultProfile, {
        address
      }).toPromise()
      setUserProfile(response.data.defaultProfile)
    } catch (err) {
      console.log('error fetching user profile...: ', err)
    }
  }

  async function listenForRouteChangeEvents() {
    router.events.on('routeChangeStart', () => {
      refreshAuthToken()
    })
  }

  async function signIn() {
    try {
      const accounts = await window.ethereum.send(
        "eth_requestAccounts"
      )
      setConnected(true)
      const account = accounts.result[0]
      setUserAddress(account)
      const urqlClient = await createClient()
      const response = await urqlClient.query(getChallenge, {
        address: account
      }).toPromise()
      const provider = new providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const signature = await signer.signMessage(response.data.challenge.text)
      const authData = await urqlClient.mutation(authenticateMutation, {
        address: account, signature
      }).toPromise()
      const { accessToken, refreshToken } = authData.data.authenticate
      const accessTokenData = parseJwt(accessToken)
      getUserProfile(account)
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        accessToken, refreshToken, exp: accessTokenData.exp
      }))
    } catch (err) {
      console.log('error: ', err)
    }
  }

  return (
    <AppContext.Provider value={{
      userAddress,
      profile: userProfile
    }}>
      <div>
        <nav className={navStyle}>
          <div className={navContainerStyle}>
            <div className={linkContainerStyle}>
              <Link href='/'>
                <a>
                  <img src="/icon.svg" className={iconStyle} />
                </a>
              </Link>
              <Link href='/'>
                <a>
                  <p className={linkTextStyle}>Home</p>
                </a>
              </Link>
              <Link href='/profiles'>
                <a>
                  <p className={linkTextStyle}>Explore Profiles</p>
                </a>
              </Link>
              {
                userProfile && (
                  <Link href={`/profile/${userProfile.id}`}>
                    <a>
                      <p className={linkTextStyle}>Profile</p>
                    </a>
                  </Link>
                )
              }
            </div>
            <div className={buttonContainerStyle}>
              {
                !connected && (
                  <button className={buttonStyle} onClick={signIn}>Sign in</button>
                )
              }
              {
                connected && (
                  <button
                    className={modalButtonStyle}
                    onClick={() => setIsModalOpen(true)}>
                    <img
                      src="/create-post.svg"
                      className={createPostStyle}
                    />
                  </button>
                )
              }
            </div>
          </div>
        </nav>
        <div className={appLayoutStyle}>
          <Component {...pageProps} />
        </div>
        {
          isModalOpen && (
            <Modal
              setIsModalOpen={setIsModalOpen}
            />
          )
        }
      </div>
    </AppContext.Provider>
  )
}

const appLayoutStyle = css`
  width: 900px;
  margin: 0 auto;
  padding: 78px 0px 50px;
`

const linkTextStyle = css`
  margin-right: 40px;
  font-weight: 600;
  font-size: 15px;
`

const iconStyle = css`
  height: 35px;
  margin-right: 40px;
`

const modalButtonStyle = css`
  background-color: transparent;
  outline: none;
  border: none;
  cursor: pointer;
`

const createPostStyle = css`
  height: 35px;
  margin-right: 5px;
`

const navStyle = css`
  background-color: white;
  padding: 15px 30px;
  display: flex;
  position: fixed;
  width: 100%;
  background-color: white;
  z-index: 1;
  border-bottom: 1px solid #ededed;
`

const navContainerStyle = css`
  width: 900px;
  margin: 0 auto;
  display: flex;
`

const linkContainerStyle = css`
  display: flex;
  align-items: center;
`

const buttonContainerStyle = css`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  flex: 1;
`

const buttonStyle = css`
  border: none;
  outline: none;
  margin-left: 15px;
  background-color: black;
  color: #340036;
  padding: 13px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  background-color: rgb(249, 92, 255);
  transition: all .35s;
  width: 160px;
  letter-spacing: .75px;
  &:hover {
    background-color: rgba(249, 92, 255, .75);
  }
`

export default MyApp
