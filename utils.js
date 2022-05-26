function trimString(string, length) {
  if (!string) return null
  console.log('length: ', string.length)
  return string.length < length ? string : string.substr(0, length-1) + "..."
}

export {
  trimString
}