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