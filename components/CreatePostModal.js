import { useState, useRef } from 'react'
import { css } from '@emotion/css'

const metaData = {
  content: '',
  description: '',
  media: [] // { item: url, type: mimetype }
}

export default function CreatePostModal({
  setIsModalOpen
}) {
  const inputRef = useRef(null)
  function savePost() {
    console.log("inputRef: ", inputRef.current.innerHTML)
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
              >Save Post</button>
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