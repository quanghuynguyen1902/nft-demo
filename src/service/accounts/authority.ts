import { PublicKey } from "@solana/web3.js";
import { PROGRAM_FREEZE_NFT_ID } from "../provider/programId";

export const findAuthorityAddress = async (payer: PublicKey, nft_mint: PublicKey) => {
    const [address] = await PublicKey.findProgramAddress(
        [
            Buffer.from("freeze"),
            payer.toBuffer(),
            nft_mint.toBuffer()
        ],
        PROGRAM_FREEZE_NFT_ID
    );
    return address;
};