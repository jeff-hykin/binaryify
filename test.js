import uint8ArrayForReadmeMd from "./README.md.binaryified.js"

console.log(new TextDecoder().decode(uint8ArrayForReadmeMd))