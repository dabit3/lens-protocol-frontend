import '../styles/globals.css'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import Link from 'next/link'
import { css } from '@emotion/css'

function MyApp({ Component, pageProps }) {
  const [connected, setConnected] = useState(true)

  useEffect(() => {
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

  async function connect() {
    await window.ethereum.enable()
    setConnected(true)
  }

  return (
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
          </div>
          <div className={buttonContainerStyle}>
            {
              !connected && (
                <button className={buttonStyle} onClick={connect}>Sign in</button>
              )
            }
          </div>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

const linkTextStyle = css`
  margin-right: 40px;
  font-weight: 600;
  font-size: 15px;
`

const iconStyle = css`
  height: 35px;
  margin-right: 40px;
`

const navStyle = css`
  background-color: white;
  padding: 15px 30px;
  display: flex;
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
