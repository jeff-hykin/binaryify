#!/usr/bin/env -S deno run --allow-all
import { cyan, white, yellow, green, red } from "https://deno.land/x/quickr@0.6.47/main/console.js"
import { binaryify } from "./binaryify_api.js"
import { parseArgs, flag, required, initialValue } from "https://deno.land/x/good@1.7.1.1/flattened/parse_args.js"
import { didYouMean } from "https://deno.land/x/good@1.7.1.1/flattened/did_you_mean.js"
import version from "./version.js"

const argsInfo = parseArgs({
    rawArgs: Deno.args,
    fields: [
        [["--version"], flag],
        [["--help"], flag],
        [["--text"], flag],
    ],
    namedArgsStopper: "--",
    allowNameRepeats: true,
    valueTransformer: JSON.parse,
    isolateArgsAfterStopper: true,
})
didYouMean({
    givenWords: Object.keys(argsInfo.implicitArgsByName).filter((each) => each.startsWith(`-`)),
    possibleWords: Object.keys(argsInfo.explicitArgsByName).filter((each) => each.startsWith(`-`)),
    autoThrow: true,
    suggestionLimit: 1,
})
const { version: showVersion, help: showHelp, text } = argsInfo.explicitArgsByName
const filePaths = argsInfo.argsAfterStopper

if (showVersion) {
    console.log(version)
    Deno.exit(0)
}

if (filePaths.length == 0 || showHelp) {
    console.log(`
        To binaryify a file (or multiple) just give this command some arguments
        Instructions will be given on how to handle the binaryified-file after

        ex:
            ${green`binaryify`} -- ./your_file.something
    `.replace(/\n        /g, "\n"))
} else {
    const namesAndStuff = await Promise.all(filePaths.map((eachPath) => binaryify({ pathToBinary: eachPath, forceExportString: !!text })))
    const namePrefix = text ? "stringFor" : "uint8ArrayFor"
    console.log(`
        // paths have been generated!
        // add this wherever you need it now:

        // NOTE: this is auto-updating!
        // if you change the YOUR_FILE.wasm, YOUR_FILE.wasm.binaryified.js will change too!
    `.replace(/\n        /g, "\n"))
    for (let [realNameSuggestion, newPath] of namesAndStuff) {
        console.log(`${cyan`import`} ${yellow(namePrefix + realNameSuggestion)} ${cyan`from`} ${green(JSON.stringify(newPath))}`)
    }
}