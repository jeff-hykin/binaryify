# Binaryify

If (for bundling purposes) you want to use an import statement for data that isn't necessarily JavaScript, then this is the tool for you.

```sh
deno install -Af https://deno.land/x/binaryify/binaryify.js
# might need
export PATH="$HOME/.deno/bin:$PATH"

# usage
binaryify YOUR_FILE.wasm

# outputs:
#    // paths have been generated!
#    // add this wherever you need it now:
#    import { stringToBytes } from "https://deno.land/x/binaryify@0.0.5/tools.js"
#
#    import binaryStringForYourFileWasm from "./tree-sitter-nix.wasm.binaryified.js"
#    const bytesForYourFileWasm = stringToBytes(binaryStringForYourFileWasm)
```