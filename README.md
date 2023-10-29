# Binaryify

If (for bundling purposes) you want to use an import statement for data that isn't necessarily JavaScript, then this is the tool for you.

```sh
deno install -Af https://deno.land/x/binaryify@2.2.0.6/binaryify.js
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
import { binaryify } from "https://deno.land/x/binaryify@2.2.0.6/tools.js"
await binaryify({
    pathToBinary: "your_thing.png",
    pathToBinarified: "your_thing.png.binaryified.js",
})
```