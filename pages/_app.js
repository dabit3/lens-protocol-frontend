import '../styles/globals.css'
import Link from 'next/link'
import { css } from '@emotion/css'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className={navStyle}>
        <div className={navContainerStyle}>
          <img src="/icon.svg" className={iconStyle} />
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
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

const linkTextStyle = css`
  margin-right: 40px;
`

const iconStyle = css`
  height: 35px;
  margin-right: 25px;
`

const navStyle = css`
  background-color: white;
  padding: 20px 30px;
`

const navContainerStyle = css`
  width: 900px;
  margin: 0 auto;
  display: flex;
  align-items: center;
`

export default MyApp
