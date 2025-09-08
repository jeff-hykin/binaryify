#!/usr/bin/env sh
"\"",`$(echo --% ' |out-null)" >$null;function :{};function dv{<#${/*'>/dev/null )` 2>/dev/null;dv() { #>
echo "1.41.3"; : --% ' |out-null <#'; }; deno_version="$(dv)"; deno="$HOME/.deno/$deno_version/bin/deno"; if [ -x "$deno" ];then  exec "$deno" run -q -A --no-lock --no-config "$0" "$@";  elif [ -f "$deno" ]; then  chmod +x "$deno" && exec "$deno" run -q -A --no-lock --no-config "$0" "$@"; fi; has () { command -v "$1" >/dev/null; };  set -e;  if ! has unzip && ! has 7z; then echo "Can I try to install unzip for you? (its required for this command to work) ";read ANSWER;echo;  if [ "$ANSWER" =~ ^[Yy] ]; then  if ! has brew; then  brew install unzip; elif has apt-get; then if [ "$(whoami)" = "root" ]; then  apt-get install unzip -y; elif has sudo; then  echo "I'm going to try sudo apt install unzip";read ANSWER;echo;  sudo apt-get install unzip -y;  elif has doas; then  echo "I'm going to try doas apt install unzip";read ANSWER;echo;  doas apt-get install unzip -y;  else apt-get install unzip -y;  fi;  fi;  fi;   if ! has unzip; then  echo ""; echo "So I couldn't find an 'unzip' command"; echo "And I tried to auto install it, but it seems that failed"; echo "(This script needs unzip and either curl or wget)"; echo "Please install the unzip command manually then re-run this script"; exit 1;  fi;  fi;   if ! has unzip && ! has 7z; then echo "Error: either unzip or 7z is required to install Deno (see: https://github.com/denoland/deno_install#either-unzip-or-7z-is-required )." 1>&2; exit 1; fi;  if [ "$OS" = "Windows_NT" ]; then target="x86_64-pc-windows-msvc"; else case $(uname -sm) in "Darwin x86_64") target="x86_64-apple-darwin" ;; "Darwin arm64") target="aarch64-apple-darwin" ;; "Linux aarch64") target="aarch64-unknown-linux-gnu" ;; *) target="x86_64-unknown-linux-gnu" ;; esac fi;  print_help_and_exit() { echo "Setup script for installing deno  Options: -y, --yes Skip interactive prompts and accept defaults --no-modify-path Don't add deno to the PATH environment variable -h, --help Print help " echo "Note: Deno was not installed"; exit 0; };  for arg in "$@"; do case "$arg" in "-h") print_help_and_exit ;; "--help") print_help_and_exit ;; "-"*) ;; *) if [ -z "$deno_version" ]; then deno_version="$arg"; fi ;; esac done; if [ -z "$deno_version" ]; then deno_version="$(curl -s https://dl.deno.land/release-latest.txt)"; fi;  deno_uri="https://dl.deno.land/release/v${deno_version}/deno-${target}.zip"; deno_install="${DENO_INSTALL:-$HOME/.deno/$deno_version}"; bin_dir="$deno_install/bin"; exe="$bin_dir/deno";  if [ ! -d "$bin_dir" ]; then mkdir -p "$bin_dir"; fi;  if has curl; then curl --fail --location --progress-bar --output "$exe.zip" "$deno_uri"; elif has wget; then wget --output-document="$exe.zip" "$deno_uri"; else echo "Error: curl or wget is required to download Deno (see: https://github.com/denoland/deno_install )." 1>&2; fi;  if has unzip; then unzip -d "$bin_dir" -o "$exe.zip"; else 7z x -o"$bin_dir" -y "$exe.zip"; fi; chmod +x "$exe"; rm "$exe.zip";  exec "$deno" run -q -A --no-lock --no-config "$0" "$@";     #>}; $DenoInstall = "${HOME}/.deno/$(dv)"; $BinDir = "$DenoInstall/bin"; $DenoExe = "$BinDir/deno.exe"; if (-not(Test-Path -Path "$DenoExe" -PathType Leaf)) { $DenoZip = "$BinDir/deno.zip"; $DenoUri = "https://github.com/denoland/deno/releases/download/v$(dv)/deno-x86_64-pc-windows-msvc.zip";  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;  if (!(Test-Path $BinDir)) { New-Item $BinDir -ItemType Directory | Out-Null; };  Function Test-CommandExists { Param ($command); $oldPreference = $ErrorActionPreference; $ErrorActionPreference = "stop"; try {if(Get-Command "$command"){RETURN $true}} Catch {Write-Host "$command does not exist"; RETURN $false}; Finally {$ErrorActionPreference=$oldPreference}; };  if (Test-CommandExists curl) { curl -Lo $DenoZip $DenoUri; } else { curl.exe -Lo $DenoZip $DenoUri; };  if (Test-CommandExists curl) { tar xf $DenoZip -C $BinDir; } else { tar -Lo $DenoZip $DenoUri; };  Remove-Item $DenoZip;  $User = [EnvironmentVariableTarget]::User; $Path = [Environment]::GetEnvironmentVariable('Path', $User); if (!(";$Path;".ToLower() -like "*;$BinDir;*".ToLower())) { [Environment]::SetEnvironmentVariable('Path', "$Path;$BinDir", $User); $Env:Path += ";$BinDir"; } }; & "$DenoExe" run -q -A --no-lock --no-config "$PSCommandPath" @args; Exit $LastExitCode; <# 
# */0}`;
import { FileSystem } from "https://deno.land/x/quickr@0.8.1/main/file_system.js"
// the irony of needing to use the (js) binaryify to build the rust binaryify
import { binaryify } from "https://deno.land/x/binaryify@2.5.5.0/binaryify_api.js"

import { parseArgs, flag, required, initialValue } from "https://esm.sh/gh/jeff-hykin/good-js@1.17.1.0/source/flattened/parse_args.js"
import { didYouMean } from "https://esm.sh/gh/jeff-hykin/good-js@1.17.1.0/source/flattened/did_you_mean.js"

const output = parseArgs({
    rawArgs: Deno.args,
    fields: [
        [["--help"], flag ],
        [["--output-folder"], initialValue(`${FileSystem.pwd}/pkg`),],
        [["--main-file-name"], initialValue(`main.js`),],
        [["--wasm-in-js-name"], initialValue(`wasm_bytes.js`),],
        [["--wasm-source-path"], initialValue(null),],
        [["--js-source-path"], initialValue(null),],
    ],
    namedArgsStopper: "--",
    allowNameRepeats: true,
    valueTransformer: JSON.parse,
    isolateArgsAfterStopper: false,
    argsByNameSatisfiesNumberedArg: true,
    implicitNamePattern: /^(--|-)[a-zA-Z0-9\-_]+$/,
})
didYouMean({
    givenWords: Object.keys(output.implicitArgsByName).filter(each=>each.startsWith(`-`)),
    possibleWords: Object.keys(output.explicitArgsByName).filter(each=>each.startsWith(`-`)),
    autoThrow: true,
    suggestionLimit: 1,
})

var { help, outputFolder, mainFileName, wasmInJsName, wasmSourcePath, jsSourcePath } = output.explicitArgsByName
if (help) {
    console.log(`
        wasm-pack-embed-unofficial should be run immediately after calling wasm-pack build --target web
        ex: wasm-pack build --target web && wasm-pack-embed-unofficial

        Options:
            wasm-pack-embed-unofficial --main-file-name my_main.js
            wasm-pack-embed-unofficial --output-folder ./pkg
            wasm-pack-embed-unofficial --wasm-in-js-name wasm_as_uint8array.js
    `.replace(/\n        /g, "\n"))
}

// 
// get wasm source path and js source path
// 
const pathToPackageJson = `${outputFolder}/package.json`
if (!wasmSourcePath || !jsSourcePath) {
    try {
        const data = JSON.parse(await FileSystem.read(pathToPackageJson))
        wasmSourcePath = wasmSourcePath || `${outputFolder}/${data.files.find(each=>each.endsWith(".wasm"))}`
        jsSourcePath = jsSourcePath || `${outputFolder}/${data.files.find(each=>each.endsWith(".js"))}`
    } catch (error) {
        throw Error(`(from wasm-pack-embed-unofficial)\nTo find the wasm file, I need to read the package.json file in the output folder (usually ./pkg). But when I tried to read ${JSON.stringify(pathToPackageJson)}, I got this error: ${error.message}.\n\nNote you can use the --output-folder flag to specify a folder other than ./pkg\nIn a last-ditch effort you can also specify --wasm-source-path and --js-source-path directly (so I don't even read the package.json)`)
    }
}
if (!wasmSourcePath) {
    throw new Error(`wasm file not mentioned in .files of ${pathToPackageJson} and was not specified with --wasm-source-path`)
}
if (!jsSourcePath) {
    throw new Error(`js file not mentioned in .files of ${pathToPackageJson} and was not specified with --js-source-path`)
}

// create the wasm-in-js file
await binaryify({
    pathToBinary: wasmSourcePath,
    pathToBinarified: outputFolder+"/"+wasmInJsName,
    disableSelfUpdating: true, // default is false
})

const jsSourceRelativePath = FileSystem.makeRelativePath({from: outputFolder, to: jsSourcePath})
// create the main.js file
await FileSystem.write({
    path: `${outputFolder}/${mainFileName}`,
    data: `import wasmBytes from ${JSON.stringify(`./${FileSystem.normalizePath(wasmInJsName)}`)}
import * as wasmPack from ${JSON.stringify(`./${FileSystem.normalizePath(jsSourceRelativePath)}`)}
wasmPack.initSync({module:wasmBytes})
export default wasmPack
`,
})

// (this comment is part of deno-guillotine, dont remove) #>