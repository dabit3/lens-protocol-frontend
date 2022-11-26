import { useState, useContext } from 'react'
import { ethers } from 'ethers'
import { AppContext } from '../context'
import { css } from '@emotion/css'
import { PINK } from '../theme'
import { Button } from '../components'
import { v4 as uuid } from 'uuid'
import { create } from 'ipfs-http-client'
import PERIPHERY from '../abi/lensperiphery.json'
import {
  createProfileMetadataTypedData,
  createClient,
  PERIPHERY_CONTRACT_ADDRESS
} from '../api'
import { signedTypeData, splitSignature, getSigner } from '../utils'

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID
const projectSecret = process.env.NEXT_PUBLIC_PROJECT_SECRET
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
      authorization: auth,
  },
})

export default function EditProfile() {
  const [updatedProfile, setUpdatedProfile] = useState()
  const context = useContext(AppContext)
  const { profile } = context

  async function updateProfile() {
    if (!updatedProfile) return

    if (updatedProfile.twitter) {
      const index = profile.attributes.findIndex(v => v.key === 'twitter')
      profile.attributes[index].value = updatedProfile.twitter
    }

    const newMeta = {
      name: profile.name,
      bio: profile.bio,
      attributes: profile.attributes,
      version: "1.0.0",
      metadata_id: uuid(),
      previousMetadata: profile.metadata,
      createdOn: new Date().toISOString(),
      appId: "NaderDabitLensStarter",
      ...updatedProfile,
    }

    if (profile.coverPicture) {
      newMeta.cover_picture = profile.coverPicture.original.url
    } else {
      newMeta.cover_picture = null
    }

    const added = await client.add(JSON.stringify(newMeta))

    const newMetadataURI = `https://ipfs.infura.io/ipfs/${added.path}`

    // using the GraphQL API may be unnecessary
    // if you are not using gasless transactions
    const urqlClient = await createClient()
    const data = await urqlClient.mutation(createProfileMetadataTypedData, {
      profileId: profile.id, metadata: newMetadataURI
    }).toPromise()

    const typedData = data.data.createSetProfileMetadataTypedData.typedData;
    
    const signature = await signedTypeData(typedData.domain, typedData.types, typedData.value)
    const { v, r, s } = splitSignature(signature);

    const contract = new ethers.Contract(
      PERIPHERY_CONTRACT_ADDRESS,
      PERIPHERY,
      getSigner()
    )

    const tx = await contract.setProfileMetadataURIWithSig({
      profileId: profile.id,
      metadata: newMetadataURI,
      sig: {
        v,
        r,
        s,
        deadline: typedData.value.deadline,
      },
    });
    console.log('tx: ', tx)
  }
 
  if (!profile) {
    return null
  }

  const meta = profile.attributes.reduce((acc, next) => {
    acc[next.key] = next.value
    return acc
  }, {})

  return (
    <div className={containerStyle}>
      <h2>Edit Profile</h2>
      <div className={formContainer}>
        <label className={labelStyle}>Name</label>
        <input
          value={updatedProfile && updatedProfile.name ? updatedProfile.name : profile.name}
          className={inputStyle}
          onChange={e => setUpdatedProfile({ ...updatedProfile, name: e.target.value })}
        />
        <label className={labelStyle}>Bio</label>
        <textarea
          value={updatedProfile && updatedProfile.bio ? updatedProfile.bio : profile.bio}
          className={textAreaStyle}
          onChange={e => setUpdatedProfile({ ...updatedProfile, bio: e.target.value })}
        />
        {
          meta && meta.twitter && (
            <>
              <label className={labelStyle}>Twitter</label>
              <input
                value={updatedProfile && updatedProfile.twitter ? updatedProfile.twitter : meta.twitter}
                className={inputStyle}
                onChange={e => setUpdatedProfile({ ...updatedProfile, twitter: e.target.value })}
              />
            </>
          )
        }
        <Button
          buttonText="Save Profile"
          onClick={updateProfile}
        />
      </div>
    </div>
  )
}

const containerStyle = css`
  padding-top: 25px;
`

const inputStyle = css`
  width: 100%;
  border-radius: 12px;
  outline: none;
  border: 2px solid rgba(0, 0, 0, .05);
  padding: 12px 18px;
  font-size: 14px;
  border-color: transpaent;
  margin-top: 10px;
  margin-bottom: 30px;
  &:focus {
    border-color: rgb(${PINK});
  }
`

const textAreaStyle = css`
  ${inputStyle};
  height: 100px;
`

const labelStyle = css`
  font-weight: 600;
`

const formContainer = css`
  margin-top: 40px;
`