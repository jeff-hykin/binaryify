import { FileSystem } from "https://deno.land/x/quickr@0.6.30/main/file_system.js"
import { toCamelCase } from "https://deno.land/x/good@0.7.8/string.js"
import { stringToBacktickRepresentation, bytesToString, pureBinaryify } from "./tools.js"

export async function binaryify({pathToBinary, pathToBinarified}) {
    pathToBinarified = pathToBinarified || pathToBinary+".binaryified.js"
    await FileSystem.write({
        path: pathToBinarified,
        data: pureBinaryify(await Deno.readFile(pathToBinary))
    })
    if (FileSystem.isRelativePath(pathToBinarified)) {
        pathToBinarified = `./${FileSystem.normalize(pathToBinarified)}`
    }
    const nameSuggestion = toCamelCase(FileSystem.basename(pathToBinary))
    const realNameSuggestion = nameSuggestion[0].toUpperCase()+[...nameSuggestion].slice(1,).join("")
    return [ realNameSuggestion, pathToBinarified ]
}

export async function unbinaryifyFolder({whereToDumpData, folders, symlinks, hardlinks, setPermissions, makeNestedFolder, makeSymlink, writeBytes}) {
    // make folders first
    await Promise.all(folders.map(async ({ path, permissions }) => {
        path = `${whereToDumpData}/${path}`
        await makeNestedFolder(path)
        await setPermissions(path, permissions)
    }))
    await Promise.all(symlinks.concat(hardlinks).map(async ({ path, target, permissions, id, bytes }) => {
        path = `${whereToDumpData}/${path}`
        if (target) {
            await makeSymlink(target, path)
        } else {
            await writeBytes(path, bytes)
        }
        await setPermissions(path, permissions)
    }))
}