import {Keypair, Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction} from "@solana/web3.js";
import base58 from "bs58";
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

let connection = new Connection("https://api.devnet.solana.com");

// 5pVyoAeURQHNMVU7DmfMHvCDNmTEYXWfEwc136GYhTKG

const applicantWallet = Keypair.fromSecretKey(
    base58.decode("5A1v58EfgcwxX2BXkndTewGfzUgwaqk2LF3USs5T3DddgxzrnvgcwbaMyr5sUWjWTKM1fZjZYkuygNnpZunxG3pu")
);

// const approverWallet = Keypair.fromSecretKey(
//     base58.decode("2WBM2v7kQLrpV2WnXYuEAeA8ZCk55KqSQgQiZD2EGRuuWg3SmAXTjfFD8SdYD22bFfyK4Xur4rdJ3P9nrM7jYWNL")
// );

(async () => {
    let mint = Keypair.generate()
    console.log(`mint: ${mint.publicKey.toBase58()}`);

    let ata = await getAssociatedTokenAddress(mint.publicKey, applicantWallet.publicKey);

    let tokenMetadataPubkey = await getMetadataPDA(mint.publicKey);

    let masterEditionPubkey = await getMasterEditionPDA(mint.publicKey);

    let tx = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: applicantWallet.publicKey,
            newAccountPubkey: mint.publicKey,
            lamports: await getMinimumBalanceForRentExemptMint(connection),
            space: MINT_SIZE,
            programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(mint.publicKey, 0, applicantWallet.publicKey, applicantWallet.publicKey),
        createAssociatedTokenAccountInstruction(applicantWallet.publicKey, ata, applicantWallet.publicKey, mint.publicKey),
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
                        name: "Fake SMS #1355",
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
        ),
        // createApproveInstruction(
        //     ata,
        //     applicantWallet.publicKey,
        //     applicantWallet.publicKey,
        //     1,
        //     [],
        //     TOKEN_PROGRAM_ID)
    );

    console.log(await connection.sendTransaction(tx, [applicantWallet, mint]));

    // const [edition] = await PublicKey.findProgramAddress(
    //     [
    //         Buffer.from("metadata"),
    //         PROGRAM_ID.toBuffer(),
    //         mint.publicKey.toBuffer(),
    //         Buffer.from("edition"),
    //     ],
    //     PROGRAM_ID
    // );

    // const freezeTx = createFreezeDelegatedAccountInstruction(
    //     {
    //         delegate: approverWallet.publicKey,
    //         tokenAccount: ata,
    //         edition,
    //         mint: mint.publicKey,
    //         tokenProgram: TOKEN_PROGRAM_ID,
    //     },
    //     PROGRAM_ID
    // )
    // let tx1 = new Transaction().add(freezeTx);
    //
    //
    // const txId = await sendAndConfirmTransaction(connection, tx1, [approverWallet], {
    //     skipPreflight: true,
    //     commitment: "confirmed",
    // });
})();

async function getMetadataPDA(mint: PublicKey): Promise<PublicKey> {
    const [publicKey] = await PublicKey.findProgramAddress(
        [Buffer.from("metadata"), MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        MPL_TOKEN_METADATA_PROGRAM_ID
    );
    return publicKey;
}

async function getMasterEditionPDA(mint: PublicKey): Promise<PublicKey> {
    const [publicKey] = await PublicKey.findProgramAddress(
        [Buffer.from("metadata"), MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer(), Buffer.from("edition")],
        MPL_TOKEN_METADATA_PROGRAM_ID
    );
    return publicKey;
}