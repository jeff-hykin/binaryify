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
        
        // same as:
        // if (getBit(finalByte, index)) {
        //     newBytes[index] = setBit(newBytes[index], seven)
        // }
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
let output = stringToBytes(`# Binar yify

W ant to  bundle  a wasm  file, i mage, o r other  data i nto you r JavaS cript C LI prog ram? Th en this  is the  tool f or you. 

\`\`\`sh 
deno i nstall  -Af htt ps://de no.land /x/bina ryify@2 .5.0.0/ binaryi fy.js
#  might  need
ex port PA TH="\$HO ME/.den o/bin:\$ PATH"

 # usage 
binary ify --  YOUR_FI LE.wasm 

# out puts:
#     //  paths h ave bee n gener ated!
#     //  add thi s where ver you  need i t now:
 #
#     // NOTE : this  is auto -updati ng!
#     // if  you ch ange th e YOUR_ FILE.wa sm, YOU R_FILE. wasm.bi naryifi ed.js w ill cha nge too !
#     import  uint8Ar rayForY ourFile  from " ./YOUR_ FILE.wa sm.bina ryified .js"
\`\` \`


You  can us e the i nterfac e progr amatica lly as  well:
  
\`\`\`js
 import  { binar yify }  from "h ttps:// deno.la nd/x/bi naryify @2.5.0. 0/binar yify_ap i.js"
a wait bi naryify ({
     pathToB inary:  "your_t hing.pn g",
     pathTo Binarif ied: "y our_thi ng.png. binaryi fied.js ",
})
\` \`\`

You  can ev en bina ryify s tuff cl ient-si de on t he web! 
 
\`\`\`j s
impor t { pur eBinary ify } f rom "ht tps://d eno.lan d/x/bin aryify@ 2.5.0.0 /tools. js"
con st uint 8ArrayF romAFil e = new  Uint8A rray(ne w Array Buffer( 7))
con st jsFi leStrin g = pur eBinary ify(uin t8Array FromAFi le)
\`\`\` 

<!--  howdy h owdy ho wdy 4-- >       `)
const relativePathToOriginal = "README.md"
try {
    if (relativePathToOriginal && globalThis?.Deno?.readFileSync instanceof Function) {
        const { FileSystem } = await import("https://deno.land/x/quickr@0.6.72/main/file_system.js")
        // equivlent to: import.meta.resolve(relativePathToOriginal)
        // but more bundler-friendly
        const path = `${FileSystem.thisFolder}/${relativePathToOriginal}`
        const current = await Deno.readFile(path)
        output = current
        // update the file whenever (no await)
        const thisFile = FileSystem.thisFile // equivlent to: import.meta.filename, but more bundler-friendly
        setTimeout(async () => {
            try {
                const changeOccured = !(current.length == output.length && current.every((value, index) => value == output[index]))
                // update this file
                if (changeOccured) {
                    output = current
                    const { binaryify } = await import("https://deno.land/x/binaryify@2.5.0.0/binaryify_api.js")
                    await binaryify({
                        pathToBinary: path,
                        pathToBinarified: thisFile,
                    })
                }
            } catch (e) {
            }
        }, 0)
    }
} catch (e) {
    console.error(e)
}
        
export default output