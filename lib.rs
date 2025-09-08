use wasm_bindgen::prelude::*;

// This tells the compiler to expose the function to JS
#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}
