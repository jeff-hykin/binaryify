import { hashers } from "https://deno.land/x/good@1.9.1.1/encryption.js"
import { escapeJsString } from "https://esm.sh/gh/jeff-hykin/good-js@1.18.0.0/source/flattened/escape_js_string.js"

export function getBit(n, bit) {
    return n >> bit & 1
}

export function isValidUtf8(bytes) {
    try {
        new TextDecoder("utf8", { fatal: true }).decode(bytes)
    } catch {
        return false
    }
    return true
}

export function setBit(n, bit, value=1) {
    if (value) {
        return n | (1 << bit)
    } else {
        return ~(~n | (1 << bit))
    }
}

export function concatUint8Arrays(arrays) {
    // Calculate the total length of the concatenated array
    let totalLength = 0
    for (const arr of arrays) {
        totalLength += arr.length
    }

    // Create a new Uint8Array with the total length
    const result = new Uint8Array(totalLength)

    // Copy the elements from each source array into the result array
    let offset = 0
    for (const arr of arrays) {
        result.set(arr, offset)
        offset += arr.length
    }

    return result
}

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

export const stringToBacktickRepresentation = escapeJsString

export function pureBinaryify(bytes, relativePathToOriginal, version, { disableSelfUpdating = false, forceExportString = false } = {}) {
    if (bytes instanceof ArrayBuffer) {
        bytes = new Uint8Array(bytes)
    } else if (!(bytes instanceof Uint8Array)) {
        throw new Error("pureBinaryify() only works with Uint8Arrays")
    }
    let updateSelf = ""
    if (relativePathToOriginal && !disableSelfUpdating) {
        if (version) {
            version = `@${version}`
        }
        updateSelf = `
            const relativePathToOriginal = ${JSON.stringify(relativePathToOriginal)}
            try {
                if (relativePathToOriginal && globalThis?.Deno?.readFileSync instanceof Function) {
                    const { FileSystem } = await import("https://deno.land/x/quickr@0.6.72/main/file_system.js")
                    // equivlent to: import.meta.resolve(relativePathToOriginal)
                    // but more bundler-friendly
                    const path = \`\${FileSystem.thisFolder}/\${relativePathToOriginal}\`
                    ${forceExportString?
                            `const current = await Deno.readTextFile(path)`
                        :
                            `const current = await Deno.readFile(path)`
                    }
                    const original = output
                    output = current

                    // update the file whenever (no await)
                    const thisFile = FileSystem.thisFile // equivlent to: import.meta.filename, but more bundler-friendly
                    setTimeout(async () => {
                        try {
                            const changeOccured = !(current.length == original.length && current.every((value, index) => value == original[index]))
                            // update this file
                            if (changeOccured) {
                                const { binaryify } = await import("https://deno.land/x/binaryify${version}/binaryify_api.js")
                                await binaryify({
                                    pathToBinary: path,
                                    pathToBinarified: thisFile,
                                    forceExportString: ${forceExportString},
                                })
                            }
                        } catch (e) {
                        }
                    }, 0)
                }
            } catch (e) {
                
            }
        `.replace(/\n            /g,"\n")
    }
    // if all bytes are valid utf8 (e.g. plaintext), then we can save a lot on compression and just use the string
    try {
        if (forceExportString) {
            return `let output = ${stringToBacktickRepresentation(
                new TextDecoder("utf8", { fatal: true }).decode(bytes)
            )}${updateSelf}\nexport default output`
        } else {
            return `let output = new TextEncoder().encode(${stringToBacktickRepresentation(
                new TextDecoder("utf8", { fatal: true }).decode(bytes)
            )})${updateSelf}\nexport default output`
        }
    // if invalid utf8, then we fallback on using bytes
    } catch (error) {
        if (forceExportString) {
            console.warn(`Binaryify was called with forceExportString=true.\nThere were some bytes that were not valid utf8.\nThose bytes will be ignored, but it may be a cause for concern`)
            return `let output = ${stringToBacktickRepresentation(
                new TextDecoder("utf8", { fatal: true }).decode(bytes)
            )}${updateSelf}\nexport default output`
        }
    }
    return `${eightToSeven.toString()}\n${stringToBytes.toString()}
let output = stringToBytes(${stringToBacktickRepresentation(bytesToString(bytes))})${updateSelf}
export default output`
}

export async function pureBinaryifyFolder({ listOfPaths, getPermissions, isSymlink, isFolder, getFileBytes, readLink }) {
    let folders = []
    let symlinks = []
    let hardlinks = []
    let permissionKinds = []
    let contents = {}
    await Promise.all(listOfPaths.map(async (each) => {
    
        // TODO: error if its an absolute path

        const permissions = await getPermissions(each)
        const permissionsKey = JSON.stringify(permissions)
        let permissionsId = permissionKinds.indexOf(permissionsKey)
        if (permissionsId == -1) {
            permissionKinds.push(permissionsKey)
            permissionsId = permissionKinds.length-1
        }
        const pId = permissionsId

        if (await isSymlink(each)) {
            symlinks.push([pId, each, await readLink(each)])
        } else if (await isFolder(each)) {
            folders.push([pId, each])
        } else {
            const bytes = await getFileBytes(each)
            const id = await hashers.sha256(bytes)
            if (!contents[id]) {
                contents[id] = bytesToString(bytes)
            }
            hardlinks.push([pId, each, id])
        }
    }))
    
    permissionKinds = permissionKinds.map(each=>JSON.parse(each))
    return `${eightToSeven.toString()}\n${stringToBytes.toString()}
const permissionKinds = Object.freeze(${JSON.stringify(permissionKinds)})
export const folders = ${JSON.stringify(folders)}
export const symlinks = ${JSON.stringify(symlinks)}
export const hardlinks = ${JSON.stringify(hardlinks)}
export const items = {}
const contents = Object.freeze(Object.seal(Object.preventExtensions({
${Object.entries(contents).map(([id, bytesAsString]) => `${JSON.stringify(id)}: stringToBytes(${stringToBacktickRepresentation(bytesAsString)}),` ).join("\n")}
})))
export class Item {
    get permissions() { return permissionKinds[this[0]] }
    get path() { return this[1] }
}
export class Folder extends Item {
    kind = "folder";
    [Symbol.for("Deno.customInspect")](inspect,options) {
        return inspect({permissions: this.permissions, path: this.path},options)
    }
}
export class Symlink extends Item {
    kind = "symlink"
    get target() { return this[2] }
    [Symbol.for("Deno.customInspect")](inspect,options) {
        return inspect({permissions: this.permissions, path: this.path, target: this.target }, options)
    }
}
export class Hardlink extends Item {
    kind = "hardlink"
    get bytes() { return contents[this[2]] }
    get contentHash() { return this[2] }
    [Symbol.for("Deno.customInspect")](inspect,options) {
        return inspect({permissions: this.permissions, path: this.path, contentHash: this.contentHash, bytes: this.bytes, }, options)
    }
}
for (const each of folders) {
    Object.setPrototypeOf(each, Folder.prototype)
    items[each[1]] = each
}
for (const each of symlinks) {
    Object.setPrototypeOf(each, Symlink.prototype)
    items[each[1]] = each
}
for (const each of hardlinks) {
    Object.setPrototypeOf(each, Hardlink.prototype)
    items[each[1]] = each
}`
}

export async function pureUnbinaryifyFolder({whereToDumpData, folders, symlinks, hardlinks, setPermissions, makeNestedFolder, makeSymlink, writeBytes}) {
    // make folders first
    await Promise.all(folders.map(async ({ path, permissions }) => {
        path = `${whereToDumpData}/${path}`
        await makeNestedFolder(path)
        await setPermissions({path, permissions})
    }))
    await Promise.all(symlinks.concat(hardlinks).map(async ({ path, target, permissions, id, bytes }) => {
        path = `${whereToDumpData}/${path}`
        if (target) {
            await makeSymlink({target, path})
        } else {
            await writeBytes({path, bytes})
        }
        await setPermissions({path, permissions})
    }))
}