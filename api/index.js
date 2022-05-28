import { createClient } from 'urql'

const APIURL = "https://api.lens.dev"

export const urqlClient = new createClient({
  url: APIURL,
})