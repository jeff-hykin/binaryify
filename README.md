# Binaryify

If (for bundling purposes) you want to use an import statement for data that isn't necessarily JavaScript, then this is the tool for you.

```sh
deno install -Af https://deno.land/x/binaryify@2.2.0.3/binaryify.js
# might need
export PATH="$HOME/.deno/bin:$PATH"

# usage
binaryify -- YOUR_FILE.wasm

# outputs:
#    // paths have been generated!
#    // add this wherever you need it now:
#
#    import binaryStringForYourFile from "./YOUR_FILE.wasm.binaryified.js"
```

```js
import { binaryify } from "https://deno.land/x/binaryify@2.2.0.3/tools.js"
await binaryify({
    pathToBinary: "your_thing.png",
    pathToBinarified: "your_thing.binaryified.js",
})
```

### Example Run 

<img width="839" src="https://user-images.githubusercontent.com/17692058/215970396-87775193-7657-4794-a4ba-2feafe62ec3c.png">
