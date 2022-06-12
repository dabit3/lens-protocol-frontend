import { css } from '@emotion/css'

export function SearchButton({
  buttonText,
  onClick
}) {
  return (
    <button
      className={buttonStyle}
      onClick={onClick}
    >{buttonText}</button>
  )
}

const buttonStyle = css`
border: none;
outline: none;
margin-left: 15px;
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