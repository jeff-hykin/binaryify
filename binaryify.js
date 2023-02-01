#!/usr/bin/env -S deno run --allow-all
import { ensure } from 'https://deno.land/x/ensure/mod.ts'; ensure({ denoVersion: "1.17.1", })
import { FileSystem } from "https://deno.land/x/quickr@0.6.15/main/file_system.js"
import { capitalize, indent, toCamelCase, digitsToEnglishArray, toPascalCase, toKebabCase, toSnakeCase, toScreamingtoKebabCase, toScreamingtoSnakeCase, toRepresentation, toString } from "https://deno.land/x/good@0.7.8/string.js"
import { Console, cyan, white, yellow, green, red } from "https://deno.land/x/quickr@0.6.15/main/console.js"
import { bytesToString } from './tools.js'

if (!Deno.args) {
    console.log(`
        To binaryify a file (or multiple) just give this command some arguments
        Instructions will be given on how to handle the binaryified-file after
    `)
} else {
    const namesAndStuff = await Promise.all(
        Deno.args.map(eachPath=>binaryify(eachPath))
    )
    console.log(`
// paths have been generated!
// add this wherever you need it now:
${cyan`import`} { ${red("stringToBytes")} } ${cyan`from`} ${green`"https://deno.land/x/binaryify@0.0.6/tools.js"`}\n`)
    for (let [realNameSuggestion, newPath] of namesAndStuff) {
        console.log(`${cyan`import`} ${yellow("binaryStringFor"+realNameSuggestion)} ${cyan`from`} ${green(JSON.stringify(newPath))}`)
    }
    for (let [realNameSuggestion, newPath] of namesAndStuff) {
        console.log(`${cyan`const`} ${yellow("uint8ArrayFor"+realNameSuggestion)} = ${red`stringToBytes(`}${yellow("binaryStringFor"+realNameSuggestion)}${red`)`}`)
    }
}

async function binaryify(path) {
    let newPath = path+".binaryified.js"
    await FileSystem.write({
        path: newPath,
        data: `export default ${JSON.stringify(bytesToString(await Deno.readFile(path)))}`,
    })
    if (FileSystem.isRelativePath(newPath)) {
        newPath = `./${FileSystem.normalize(newPath)}`
    }
    const nameSuggestion = toCamelCase(FileSystem.basename(path))
    const realNameSuggestion = nameSuggestion[0].toUpperCase()+[...nameSuggestion].slice(1,).join("")
    return [ realNameSuggestion, newPath ]
}