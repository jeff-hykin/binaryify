import { FileSystem } from "https://deno.land/x/quickr@0.6.30/main/file_system.js"
import { toCamelCase } from "https://deno.land/x/good@0.7.8/string.js"
import { stringToBacktickRepresentation, bytesToString } from "./tools.js"

export async function binaryify({pathToBinary, pathToBinarified}) {
    pathToBinarified = pathToBinarified || pathToBinary+".binaryified.js"
    await FileSystem.write({
        path: pathToBinarified,
        data: `
            function eightToSeven(eightBytes) {
                const seven = 7
                const sevenBytes = eightBytes.slice(0,seven)
                const finalByte = eightBytes[seven]
                const newBytes = new Uint8Array(new ArrayBuffer(seven))
                let index = -1
                for (const each of sevenBytes) {
                    index++
                    // first seven bits go into respective elements (copied)
                    newBytes[index] = each

                    if (finalByte >> index & 1) {
                        newBytes[index] = newBytes[index] | (1 << seven)
                    }
                }
                return newBytes
            }

            function stringToBytes(string) {
                const charCount = string.length
                const buf = new ArrayBuffer(charCount)
                const asciiNumbers = new Uint8Array(buf)
                for (var i=0; i < charCount; i++) {
                    asciiNumbers[i] = string.charCodeAt(i)
                }
                const chunksOfEight = asciiNumbers.slice(0,-1)
                let sliceEnd = -asciiNumbers.slice(-1)[0]
                
                const eight = 8
                // chunksOfEight.length/8 should always result in an integer
                const numberOfBlocks = Math.ceil(chunksOfEight.length/eight)
                const arrays = []
                for (let index in [...Array(numberOfBlocks)]) {
                    index-=0
                    arrays.push(
                        eightToSeven(
                            chunksOfEight.slice(index*eight,(index+1)*eight)
                        )
                    )
                }

                // Calculate the total length of the concatenated array
                let totalLength = 0
                for (const arr of arrays) {
                    totalLength += arr.length
                }

                // Create a new Uint8Array with the total length
                const array = new Uint8Array(totalLength)

                // Copy the elements from each source array into the result array
                let offset = 0
                for (const arr of arrays) {
                    array.set(arr, offset)
                    offset += arr.length
                }

                if (sliceEnd == 0) {
                    sliceEnd = array.length
                }
                return array.slice(0,sliceEnd)
            }
            
            export default stringToBytes(${stringToBacktickRepresentation(bytesToString(await Deno.readFile(pathToBinary)))})
        `,
    })
    if (FileSystem.isRelativePath(pathToBinarified)) {
        pathToBinarified = `./${FileSystem.normalize(pathToBinarified)}`
    }
    const nameSuggestion = toCamelCase(FileSystem.basename(pathToBinary))
    const realNameSuggestion = nameSuggestion[0].toUpperCase()+[...nameSuggestion].slice(1,).join("")
    return [ realNameSuggestion, pathToBinarified ]
}