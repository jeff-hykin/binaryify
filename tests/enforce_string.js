import { binaryify } from "../binaryify_api.js"

await binaryify({
    pathToBinary: "../README.md",
    pathToBinarified: "../logs/README.md.binaryified.js",
    forceExportString: true,
})