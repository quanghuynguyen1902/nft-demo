import base58 from "bs58";
import {Keypair} from "@solana/web3.js";

export const wallet = Keypair.fromSecretKey(
    base58.decode("5A1v58EfgcwxX2BXkndTewGfzUgwaqk2LF3USs5T3DddgxzrnvgcwbaMyr5sUWjWTKM1fZjZYkuygNnpZunxG3pu")
);
