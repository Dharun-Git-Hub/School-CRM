const keys = require('./keys.cjs')
const AES = require('crypto-js/aes')
const Utf8 = require('crypto-js/enc-utf8')

const encryptRandom = (data) => {
    const aesKey = keys[Math.floor(Math.random() * keys.length)]
    console.log(Math.floor(Math.random() * keys.length))
    const encrypted = AES.encrypt(data,aesKey).toString()
    return encrypted
}

const decryptRandom = (data) => {
    for(let i=0;i<keys.length;i++){
        try{
            if(AES.decrypt(data, keys[i]).toString(Utf8).trim() === '')
                continue
            else
                return AES.decrypt(data, keys[i]).toString(Utf8)
        }
        catch(err){}
    }
}

module.exports = {
    encryptRandom,
    decryptRandom
}