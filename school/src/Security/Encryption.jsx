import { AES } from "crypto-js"
import crypto from "crypto-js"
import keys from "./Keys"

export const encryptRandom = (data) => {
    console.log(data)
    let index = Math.floor(Math.random() * keys.length)
    const encrypted = AES.encrypt(data,keys[index]).toString()
    return encrypted
}

export const decryptRandom = (data) => {
    for(let i=0;i<keys.length;i++){
        try {
            const decrypted = AES.decrypt(data, keys[i]).toString(crypto.enc.Utf8);
            if (decrypted && decrypted.trim() !== '')
                return decrypted;
        } catch (err) {}
    }
    return null;
}