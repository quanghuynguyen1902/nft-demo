import { AnchorProvider, Program } from "@project-serum/anchor";
import {PROGRAM_FREEZE_NFT_ID} from "./programId";
import idl from "../idl/idl.json";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import {Connection} from "@solana/web3.js";
import {wallet} from "./wallet";

let nodeWallet = new NodeWallet(wallet)
export const connection = new Connection("https://api.devnet.solana.com");

const provider = new AnchorProvider(connection, nodeWallet, {
    commitment: "processed",
});

export  const program = new Program(idl as any, PROGRAM_FREEZE_NFT_ID, provider);