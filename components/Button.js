import { css } from '@emotion/css'
import { PINK } from '../theme'

export function Button({
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
background-color: rgb(${PINK});
transition: all .35s;
width: 240px;
letter-spacing: .75px;
&:hover {
  background-color: rgba(${PINK}, .75);
}
`