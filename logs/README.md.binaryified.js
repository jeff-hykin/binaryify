let output = `# Binaryify

Want to bundle a wasm file, image, or other data into your JavaScript CLI program? Then this is the tool for you.

\`\`\`sh
deno install -Afg https://deno.land/x/binaryify@2.5.3.0/binaryify.js
# might need
export PATH="$HOME/.deno/bin:$PATH"

# usage
binaryify -- YOUR_FILE.wasm

# outputs:
#    // paths have been generated!
#    // add this wherever you need it now:
#
#    // NOTE: this is auto-updating!
#    // if you change the YOUR_FILE.wasm, YOUR_FILE.wasm.binaryified.js will change too!
#    import uint8ArrayForYourFile from "./YOUR_FILE.wasm.binaryified.js"
\`\`\`


You can use the interface programatically as well:
 
\`\`\`js
import { binaryify } from "https://deno.land/x/binaryify@2.5.3.0/binaryify_api.js"
await binaryify({
    pathToBinary: "your_thing.png",
    pathToBinarified: "your_thing.png.binaryified.js",
})
\`\`\`

Now you can then import that file like this: 
\`\`\`js
import uint8ArrayOfYourFile from "./your_thing.png.binaryified.js"
console.log(uint8ArrayOfYourFile) // Uint8Array with a bunch of bytes

// NOTE: every time 
\`\`\`

You can even binaryify stuff client-side on the web!
 
\`\`\`js
import { pureBinaryify } from "https://deno.land/x/binaryify@2.5.3.0/tools.js"
const uint8ArrayFromAFile = new Uint8Array(new ArrayBuffer(7))
const jsFileString = pureBinaryify(uint8ArrayFromAFile)
\`\`\``
const relativePathToOriginal = "../README.md"
try {
    if (relativePathToOriginal && globalThis?.Deno?.readFileSync instanceof Function) {
        const { FileSystem } = await import("https://deno.land/x/quickr@0.6.72/main/file_system.js")
        // equivlent to: import.meta.resolve(relativePathToOriginal)
        // but more bundler-friendly
        const path = `${FileSystem.thisFolder}/${relativePathToOriginal}`
        const current = await Deno.readFile(path)
        const original = output
        output = current

        // update the file whenever (no await)
        const thisFile = FileSystem.thisFile // equivlent to: import.meta.filename, but more bundler-friendly
        setTimeout(async () => {
            try {
                const changeOccured = !(current.length == original.length && current.every((value, index) => value == original[index]))
                // update this file
                if (changeOccured) {
                    const { binaryify } = await import("https://deno.land/x/binaryify@2.5.3.0/binaryify_api.js")
                    await binaryify({
                        pathToBinary: path,
                        pathToBinarified: thisFile,
                        forceExportString: true,
                    })
                }
            } catch (e) {
            }
        }, 0)
    }
} catch (e) {
    
}
        
export default output