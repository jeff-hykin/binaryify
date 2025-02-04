import { binaryify } from "../binaryify_api.js"
import { FileSystem, glob } from "https://deno.land/x/quickr@0.7.0/main/file_system.js"

const outFilePath = "../logs/README.force_string.binaryified.js"
FileSystem.sync.remove(outFilePath)

await binaryify({
    pathToBinary: "../README.md",
    pathToBinarified: outFilePath,
    forceExportString: true,
})

let output = (await import(outFilePath)).default
console.debug(`output is:`,output)