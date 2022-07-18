import { useContext, useRef } from 'react'
import { css } from '@emotion/css'
import { ethers } from 'ethers'
import { getSigner, baseMetadata } from '../utils'
import { LENS_HUB_CONTRACT_ADDRESS } from '../api'
import { AppContext } from '../context'
import LENSHUB from '../abi/lenshub'
import { create } from 'ipfs-http-client'
import { v4 as uuid } from 'uuid'
const client = create('https://ipfs.infura.io:5001/api/v0')

export default function CreatePostModal({
  setIsModalOpen
}) {
  const { profile } = useContext(AppContext)
  const inputRef = useRef(null)
  async function uploadToIPFS() {
    const metaData = {
      content: inputRef.current.innerHTML,
      description: inputRef.current.innerHTML,
      name: `Post by @${profile.handle}`,
      external_url: `https://lenster.xyz/u/${profile.handle}`,
      metadata_id: uuid(),
      createdOn: new Date().toISOString(),
      ...baseMetadata
    }
    const added = await client.add(JSON.stringify(metaData))
    const uri = `https://ipfs.infura.io/ipfs/${added.path}`
    return uri
  }
  async function savePost() {
    const contentURI = await uploadToIPFS()

    const contract = new ethers.Contract(
      LENS_HUB_CONTRACT_ADDRESS,
      LENSHUB,
      getSigner()
    )
    try {
      const postData = {
        profileId: profile.id,
        contentURI,
        collectModule: '0x23b9467334bEb345aAa6fd1545538F3d54436e96',
        collectModuleInitData: ethers.utils.defaultAbiCoder.encode(['bool'], [true]),
        referenceModule: '0x0000000000000000000000000000000000000000',
        referenceModuleInitData: []
      }
      const tx = await contract.post(postData)
      await tx.wait()
      setIsModalOpen(false)
      
    } catch (err) {
      console.log('error: ', err)
    }
  }
  return (
    <div className={containerStyle}>
      <div className={contentContainerStyle}>
        <div className={topBarStyle}>
          <div className={topBarTitleStyle}>
            <p>
              Create post
            </p>
          </div>
          <div onClick={() => setIsModalOpen(false)}>
            <img
              src="/close.svg"
              className={createPostIconStyle}
            />
          </div>
        </div>
        <div className={contentStyle}>
          <div className={bottomContentStyle}>
            <div
              className={postInputStyle}
              contentEditable
              ref={inputRef}
            />
            <div className={buttonContainerStyle}>
              <button
                className={buttonStyle}
                onClick={savePost}
              >Create Post</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const buttonStyle = css`
  border: none;
  outline: none;
  background-color: rgb(249, 92, 255);;
  padding: 13px 24px;
  color: #340036;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all .35s;
  &:hover {
    background-color: rgba(249, 92, 255, .75);
  }
`

const buttonContainerStyle = css`
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
`

const postInputStyle = css`
  border: 1px solid rgba(0, 0, 0, .14);
  border-radius: 8px;
  width: 100%;
  min-height: 60px;
  padding: 12px 14px;
  font-weight: 500;
`

const bottomContentStyle = css`
  margin-top: 10px;
  max-height: 300px;
  overflow: scroll;
`

const topBarStyle = css`
  display: flex;
  align-items: flex-end;
  border-bottom: 1px solid rgba(0, 0, 0, .1);
  padding-bottom: 13px;
  padding: 15px 25px;
`

const topBarTitleStyle = css`
  flex: 1;
  p {
    margin: 0;
    font-weight: 600;
  }
`

const contentContainerStyle = css`
  background-color: white;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, .15);
  width: 700px;
`

const containerStyle = css`
  position: fixed;
  width: 100vw;
  height: 100vh;
  z-index: 10;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, .35);
  h1 {
    margin: 0;
  }
`

const contentStyle = css`
  padding: 15px 25px;
`

const createPostIconStyle = css`
  height: 20px;
  cursor: pointer;
`