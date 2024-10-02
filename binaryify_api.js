import { FileSystem } from "https://deno.land/x/quickr@0.6.72/main/file_system.js"
import { toCamelCase } from "https://deno.land/x/good@0.7.8/string.js"
import { stringToBacktickRepresentation, bytesToString, pureBinaryify, pureUnbinaryifyFolder } from "./tools.js"
import version from "./version.js"

export async function binaryify({ pathToBinary, pathToBinarified }) {
    pathToBinarified = pathToBinarified || pathToBinary + ".binaryified.js"
    await FileSystem.write({
        path: pathToBinarified,
        data: pureBinaryify(
            await Deno.readFile(pathToBinary),
            FileSystem.makeRelativePath({from: FileSystem.parentPath(pathToBinarified), to: pathToBinary}),
            version,
        ),
        overwrite: true,
    })
    if (FileSystem.isRelativePath(pathToBinarified)) {
        pathToBinarified = `./${FileSystem.normalize(pathToBinarified)}`
    }
    const nameSuggestion = toCamelCase(FileSystem.basename(pathToBinary))
    const realNameSuggestion = nameSuggestion[0].toUpperCase() + [...nameSuggestion].slice(1).join("")
    return [realNameSuggestion, pathToBinarified]
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
