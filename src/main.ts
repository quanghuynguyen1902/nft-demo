import {
    Keypair,
    Connection,
    PublicKey,
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction,
    LAMPORTS_PER_SOL
} from "@solana/web3.js";
import base58 from "bs58";
import { PROGRAM_FREEZE_NFT_ID } from './service/provider/programId'
import {
    createApproveInstruction,
    createAssociatedTokenAccountInstruction,
    createInitializeMintInstruction,
    createMintToCheckedInstruction,
    getAssociatedTokenAddress,
    getMinimumBalanceForRentExemptMint, getOrCreateAssociatedTokenAccount,
    MINT_SIZE,
    TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
    PROGRAM_ID as MPL_TOKEN_METADATA_PROGRAM_ID,
    createCreateMetadataAccountV2Instruction,
    createCreateMasterEditionV3Instruction, createFreezeDelegatedAccountInstruction, PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import {connection} from "./service/provider/program";
import {wallet} from "./service/provider/wallet";
import {FreezeNft, getMasterEditionPDA, getMetadataPDA} from "./service/instructions/freeze_nft";
import {min} from "bn.js";

// 5pVyoAeURQHNMVU7DmfMHvCDNmTEYXWfEwc136GYhTKG

const applicantWallet = wallet

async function parseTransaction(connection: Connection, sig: string){
    const parsed = await connection.getParsedTransaction(sig, "finalized");
    if (!parsed || parsed?.meta?.err !== null) {
        throw new Error("Invalid signature");
    }
    return parsed;
};

async function test() {
    const getParsedTx = await parseTransaction(connection, "3danKMRy4oyf4mD7Sun3FtnHxQGsHyxJwxBzHN1CWzaRdK6vjwEUH6gv5yNN2Cp6SPnUxwSHYbuimkNyX2zm24bZ");
    let innerInstruction = getParsedTx?.meta?.innerInstructions;
    if (innerInstruction != null) {
        innerInstruction.map(tx => {
            let ins = tx.instructions
            ins.map(i => console.log(i))

        })
    }
}

async function mintNFT() {
    let mint = Keypair.generate()
    console.log(`mint: ${mint.publicKey.toBase58()}`);
    let mint1 = Keypair.generate()
    console.log(`mint: ${mint.publicKey.toBase58()}`);

    let ata = await getAssociatedTokenAddress(mint.publicKey, mint1.publicKey);

    let tokenMetadataPubkey = await getMetadataPDA(mint.publicKey);

    let masterEditionPubkey = await getMasterEditionPDA(mint.publicKey);

    // let freezeNft = await FreezeNft(applicantWallet, mint.publicKey)

    let tx = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: applicantWallet.publicKey,
            newAccountPubkey: mint.publicKey,
            lamports: await getMinimumBalanceForRentExemptMint(connection),
            space: MINT_SIZE,
            programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(mint.publicKey, 0, applicantWallet.publicKey, applicantWallet.publicKey),
        createAssociatedTokenAccountInstruction(applicantWallet.publicKey, ata, mint1.publicKey, mint.publicKey),
        createMintToCheckedInstruction(mint.publicKey, ata, applicantWallet.publicKey, 1, 0),
        createCreateMetadataAccountV2Instruction(
            {
                metadata: tokenMetadataPubkey,
                mint: mint.publicKey,
                mintAuthority: applicantWallet.publicKey,
                payer: applicantWallet.publicKey,
                updateAuthority: applicantWallet.publicKey,
            },
            {
                createMetadataAccountArgsV2: {
                    data: {
                        name: "Test 123",
                        symbol: "FSMB",
                        uri: "https://34c7ef24f4v2aejh75xhxy5z6ars4xv47gpsdrei6fiowptk2nqq.arweave.net/3wXyF1wvK6ARJ_9ue-O58CMuXrz5nyHEiPFQ6z5q02E",
                        sellerFeeBasisPoints: 100,
                        creators: [
                            {
                                address: applicantWallet.publicKey,
                                verified: true,
                                share: 100,
                            },
                        ],
                        collection: null,
                        uses: null,
                    },
                    isMutable: true,
                },
            }
        ),
        createCreateMasterEditionV3Instruction(
            {
                edition: masterEditionPubkey,
                mint: mint.publicKey,
                updateAuthority: applicantWallet.publicKey,
                mintAuthority: applicantWallet.publicKey,
                payer: applicantWallet.publicKey,
                metadata: tokenMetadataPubkey,
            },
            {
                createMasterEditionArgs: {
                    maxSupply: 0,
                },
            }
        )
    );

    console.log(await connection.sendTransaction(tx, [applicantWallet, mint, mint1], {}));
    //
    // const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    // await delay(1000*5);

}


(async () => {
    mintNFT()
})();

