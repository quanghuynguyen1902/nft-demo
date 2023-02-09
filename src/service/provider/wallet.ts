import base58 from "bs58";
import {Keypair} from "@solana/web3.js";

export const wallet = Keypair.fromSecretKey(
    base58.decode("3pHeV2yScQ3RivijV5CMHmNP35Udrtvt2cQuYQv8heJkq6wV6NqBL4kV7AooUXaRGnHzpPYLJjfYyabLxjed8S3a")
);
