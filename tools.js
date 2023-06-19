import { FileSystem } from "https://deno.land/x/quickr@0.6.30/main/file_system.js"
import { capitalize, indent, toCamelCase, digitsToEnglishArray, toPascalCase, toKebabCase, toSnakeCase, toScreamingtoKebabCase, toScreamingtoSnakeCase, toRepresentation, toString } from "https://deno.land/x/good@0.7.8/string.js"

export function getBit(n, bit) {
    return n >> bit & 1
}

export function setBit(n, bit, value=1) {
    if (value) {
        return n | (1 << bit)
    } else {
        return ~(~n | (1 << bit))
    }
}
export const concatUint8Arrays = (arrays) => new Uint8Array( // simplified from: https://stackoverflow.com/questions/49129643/how-do-i-merge-an-array-of-uint8arrays
        arrays.reduce((acc, curr) => (acc.push(...curr),acc), [])
    )

export function sevenToEight(sevenBytes) {
    const eight = 8
    const newBytes = new Uint8Array(new ArrayBuffer(eight))
    let index = -1
    for (const each of sevenBytes) {
        index++
        // first seven bits go into respective elements (copied)
        newBytes[index] = setBit(each, eight-1, 0)
        // leftover bits go into last element
        if (getBit(each, eight-1)) {
            newBytes[eight-1] = setBit(newBytes[eight-1], index)
        }
    }
    return newBytes
}

export function eightToSeven(eightBytes) {
    const seven = 7
    const sevenBytes = eightBytes.slice(0,seven)
    const finalByte = eightBytes[seven]
    const newBytes = new Uint8Array(new ArrayBuffer(seven))
    let index = -1
    for (const each of sevenBytes) {
        index++
        // first seven bits go into respective elements (copied)
        newBytes[index] = each

        if (getBit(finalByte, index)) {
            newBytes[index] = setBit(newBytes[index], seven)
        }
    }
    return newBytes
}

export function bytesToString(bytes) {
    const seven = 7
    const eight = 8
    const numberOfBlocks = Math.ceil(bytes.length/seven)
    const buffer = new ArrayBuffer((numberOfBlocks*eight)+1)
    const array = new Uint8Array(buffer)
    let lastSlice = []
    for (let index in [...Array(numberOfBlocks)]) {
        index-=0
        const newBytes = sevenToEight(
            lastSlice = bytes.slice(index*seven,(index+1)*seven)
        )
        let offset = -1
        for (const byte of newBytes) {
            offset++
            array[(index*eight)+offset] = byte
        }
    }
    array[array.length-1] = seven-lastSlice.length
    return new TextDecoder().decode(array)
}

export function stringToBytes(string) {
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
    const array = concatUint8Arrays(arrays)
    if (sliceEnd == 0) {
        sliceEnd = array.length
    }
    return array.slice(0,sliceEnd)
}

export async function binaryify({pathToBinary, pathToBinarified}) {
    pathToBinarified = pathToBinarified || pathToBinary+".binaryified.js"
    await FileSystem.write({
        path: pathToBinarified,
        data: `
            import { stringToBytes } from "https://deno.land/x/binaryify@2.2.0.1/tools.js"
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