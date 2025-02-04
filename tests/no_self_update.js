import { binaryify } from "../binaryify_api.js"

await binaryify({
    pathToBinary: "../README.md",
    pathToBinarified: "../logs/README.no_self_update.binaryified.js",
    forceExportString: true,
    disableSelfUpdating: true,
})