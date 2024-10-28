# Binaryify

Want to bundle a wasm file, image, or other data into your JavaScript CLI program? Then this is the tool for you.

```sh
deno install -Afg https://deno.land/x/binaryify@2.5.2.0/binaryify.js
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
```


You can use the interface programatically as well:
 
```js
import { binaryify } from "https://deno.land/x/binaryify@2.5.2.0/binaryify_api.js"
await binaryify({
    pathToBinary: "your_thing.png",
    pathToBinarified: "your_thing.png.binaryified.js",
})
```

You can even binaryify stuff client-side on the web!
 
```js
import { pureBinaryify } from "https://deno.land/x/binaryify@2.5.2.0/tools.js"
const uint8ArrayFromAFile = new Uint8Array(new ArrayBuffer(7))
const jsFileString = pureBinaryify(uint8ArrayFromAFile)
```