import { PublicKey } from '@solana/web3.js'
import idl from "../idl/idl.json"

// Program ID defined in the provided IDL. Do not edit, it will get overwritten.
export const PROGRAM_ID_IDL = new PublicKey(
    idl.metadata.address,
)

// This constant will not get overwritten on subsequent code generations and it's safe to modify it's value.
export const PROGRAM_FREEZE_NFT_ID: PublicKey = PROGRAM_ID_IDL