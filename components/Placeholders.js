import { css, keyframes } from '@emotion/css'

export function Placeholders({
  number
}) {
  const rows = []
  for (let i = 0; i < number; i ++) {
    rows.push(
      <div
        className={grayLoadingStyle}
        key={i}
      />
    )
  }
  return rows
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