# Binaryify

If (for bundling purposes) you want to use an import statement for data that isn't necessarily JavaScript, then this is the tool for you.

```sh
deno install -Af https://deno.land/x/binaryify@2.4.1.0/binaryify.js
# might need
export PATH="$HOME/.deno/bin:$PATH"

# usage
binaryify -- YOUR_FILE.wasm

# outputs:
#    // paths have been generated!
#    // add this wherever you need it now:
#
#    import uint8ArrayForYourFile from "./YOUR_FILE.wasm.binaryified.js"
```


You can use the interface programatically as well:
 
```js
import { binaryify } from "https://deno.land/x/binaryify@2.4.1.0/binaryify_api.js"
await binaryify({
    pathToBinary: "your_thing.png",
    pathToBinarified: "your_thing.png.binaryified.js",
})
```

You can even binaryify stuff client-side on the web!
 
```js
import { pureBinaryify } from "https://deno.land/x/binaryify@2.4.1.0/tools.js"
const uint8ArrayFromAFile = new Uint8Array(new ArrayBuffer(7))
const jsFileString = pureBinaryify(uint8ArrayFromAFile)
```