# Binaryify

Want to bundle a wasm file, image, or other data into plain JavaScript? Rather than converting the wasm file to base64 string, this tool takes advantage of the full range of utf8 making the resulting file as small as possible without resorting to zip-like compression. The resulting should always be ~1.125x the size of the original file. It includes auto-updating functionality. When run using Deno it will grab the original file, and update itself. When running on any other platform, or if the original file disappears, it will simply use the value embedded in the js file.

```sh
deno install -Afg https://deno.land/x/binaryify@2.5.6.0/binaryify.js
# might need
export PATH="$HOME/.deno/bin:$PATH"

# usage
binaryify -- YOUR_FILE.wasm

# outputs:
#    // paths have been generated!
#    // add this wherever you need it now:
#
#    // NOTE: when run with Deno, this is auto-updating import!
#    // if you change the YOUR_FILE.wasm, YOUR_FILE.wasm.binaryified.js will change too!
#    import uint8ArrayForYourFile from "./YOUR_FILE.wasm.binaryified.js"
```


You can use the interface programatically as well:
 
```js
import { binaryify } from "https://deno.land/x/binaryify@2.5.5.0/binaryify_api.js"
await binaryify({
    pathToBinary: "your_thing.png",
    pathToBinarified: "your_thing.png.binaryified.js",
    disableSelfUpdating: false, // default is false
    forceExportString: false, // NOTE: making this true is only useful if you're binaryify a text file
                              // when this is true, instead of exporting Uint8Array, it will export a string
})
```

Then import the binaryified file file like this: 
```js
import uint8ArrayOfYourFile from "./your_thing.png.binaryified.js"
console.log(uint8ArrayOfYourFile) // Uint8Array with a bunch of bytes
```

You can even binaryify stuff client-side on the web!
 
```js
import { pureBinaryify } from "https://deno.land/x/binaryify@2.5.5.0/tools.js"
const uint8ArrayFromAFile = new Uint8Array(new ArrayBuffer(7))
const jsFileString = pureBinaryify(uint8ArrayFromAFile)
```
