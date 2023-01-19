import {TransactionInstruction, PublicKey, AccountMeta, SystemProgram, Keypair} from '@solana/web3.js' // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_FREEZE_NFT_ID } from '../provider/programId'
import {findAuthorityAddress} from "../accounts/authority";
import {connection, program} from "../provider/program";
import {
    PROGRAM_ID,
    PROGRAM_ID as MPL_TOKEN_METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import {getAssociatedTokenAddress, TOKEN_PROGRAM_ID} from "@solana/spl-token";


export const FreezeNft = async (payer: Keypair, nft_mint: PublicKey) => {
    const authority = await findAuthorityAddress(payer.publicKey, nft_mint);
    let nftMetadata = await getMetadataPDA(nft_mint);
    console.log("nft metadata: ", nftMetadata.toString())
    let edition  = await getMasterEditionPDA(nft_mint);
    let ata = await getAssociatedTokenAddress(nft_mint, payer.publicKey);
    console.log("ata:", ata.toString())

    const transaction = await program.methods
        .freezeNft()
        .accounts({
            payer: payer.publicKey,
            authority: authority,
            nftMint: nft_mint,
            nftMetadata: nftMetadata,
            ata: ata,
            edition: edition,
            metadataProgram: PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        })
        .transaction();

    return transaction

}

export async function getMetadataPDA(mint: PublicKey): Promise<PublicKey> {
    const [publicKey] = await PublicKey.findProgramAddress(
        [Buffer.from("metadata"), MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        MPL_TOKEN_METADATA_PROGRAM_ID
    );
    return publicKey;
}

export async function getMasterEditionPDA(mint: PublicKey): Promise<PublicKey> {
    const [publicKey] = await PublicKey.findProgramAddress(
        [Buffer.from("metadata"), MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer(), Buffer.from("edition")],
        MPL_TOKEN_METADATA_PROGRAM_ID
    );
    return publicKey;
}