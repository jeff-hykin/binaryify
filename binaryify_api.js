import { FileSystem } from "https://deno.land/x/quickr@0.6.30/main/file_system.js"
import { toCamelCase } from "https://deno.land/x/good@0.7.8/string.js"
import { stringToBacktickRepresentation, bytesToString, pureBinaryify, pureUnbinaryifyFolder, makeImport } from "./tools.js"
import version from "./version.js"

export async function binaryify({ pathToBinary, pathToBinarified }) {
    pathToBinarified = pathToBinarified || pathToBinary + ".binaryified.js"
    await FileSystem.write({
        path: pathToBinarified,
        data: pureBinaryify(await Deno.readFile(pathToBinary)),
        overwrite: true,
    })
    if (FileSystem.isRelativePath(pathToBinarified)) {
        pathToBinarified = `./${FileSystem.normalize(pathToBinarified)}`
    }
    const nameSuggestion = toCamelCase(FileSystem.basename(pathToBinary))
    const realNameSuggestion = nameSuggestion[0].toUpperCase() + [...nameSuggestion].slice(1).join("")
    return [realNameSuggestion, pathToBinarified]
}

export function redo(paths) {
    return Promise.all(
        paths.map(async ([ pathToBinary, pathToBinarified ])=>{
            if (globalThis.Deno && globalThis.Deno.lstat instanceof Function) {
                const fileToBinaryifyExists = (await Deno.lstat(pathToBinary).catch(_=>0)).isFile
                if (fileToBinaryifyExists) {
                    await binaryify({pathToBinary,pathToBinarified}).catch(console.warn)
                }
            }
        })
    )
}

/**
 * EXPERIMENTAL: API WILL CHANGE
 */
export function unbinaryify({ whereToDumpData, folders, symlinks, hardlinks }) {
    return pureUnbinaryifyFolder({
        whereToDumpData,
        folders,
        symlinks,
        hardlinks,
        setPermissions: FileSystem.setPermissions,
        makeNestedFolder: (path) => Deno.mkdir(path, {recursive: true}),
        makeSymlink: ({target, path}) => Deno.symlinkSync(target, path),
        writeBytes: ({path, bytes}) => Deno.writeFileSync(path, bytes),
    })
}
