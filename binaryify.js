#!/usr/bin/env -S deno run --allow-all
import { ensure } from 'https://deno.land/x/ensure/mod.ts'; ensure({ denoVersion: "1.17.1", })
import { FileSystem } from "https://deno.land/x/quickr@0.6.30/main/file_system.js"
import { capitalize, indent, toCamelCase, digitsToEnglishArray, toPascalCase, toKebabCase, toSnakeCase, toScreamingtoKebabCase, toScreamingtoSnakeCase, toRepresentation, toString } from "https://deno.land/x/good@0.7.8/string.js"
import { Console, cyan, white, yellow, green, red } from "https://deno.land/x/quickr@0.6.30/main/console.js"
import { bytesToString, binaryify } from './tools.js'


// 
// look for the -- argument
// 
let wePassedTheSwitch = false
let endIndex = -1
for (const each of Deno.args) {
    endIndex += 1
    if (each == "--") {
        wePassedTheSwitch = true
    }
}
const args = Deno.args.slice(endIndex)

if (!args) {
    console.log(`
        To binaryify a file (or multiple) just give this command some arguments
        Instructions will be given on how to handle the binaryified-file after

        ex:
            binaryify -- ./your_file.something
    `)
} else {

    const namesAndStuff = await Promise.all(
        args.map(eachPath=>binaryify({pathToBinary:eachPath}))
    )
    Console.log(`
// paths have been generated!
// add this wherever you need it now:
`)
    for (let [realNameSuggestion, newPath] of namesAndStuff) {
        Console.log(`${cyan`import`} ${yellow("uint8ArrayFor"+realNameSuggestion)} ${cyan`from`} ${green(JSON.stringify(newPath))}`)
    }
}