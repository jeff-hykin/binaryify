use std::str::Chars;

use unicode_ident::is_xid_continue;
use serde_json;

/// A streaming backtick-string escaper that mimics JavaScript's template literal escaping rules.
pub struct JsStringEscaper<I>
where
    I: Iterator<Item = char>,
{
    iter: I,
    started: bool,
    finished: bool,
    next_char: Option<char>,
}

impl<I> JsStringEscaper<I>
where
    I: Iterator<Item = char>,
{
    /// Create a new escaper from any `IntoIterator<Item = char>`.
    pub fn new(input: I) -> Self {
        JsStringEscaper {
            iter: input,
            started: false,
            finished: false,
            next_char: None,
        }
    }
}

impl<I> Iterator for JsStringEscaper<I>
where
    I: Iterator<Item = char>,
{
    type Item = String;

    fn next(&mut self) -> Option<Self::Item> {
        if !self.started {
            self.started = true;
            self.next_char = self.iter.next();
            return Some("`".to_string());
        }

        if self.finished {
            return None;
        }

        let curr = self.next_char?;
        self.next_char = self.iter.next();

        let next = self.next_char;

        let out = match curr {
            '\\' => "\\\\".to_string(),
            '`' => "\\`".to_string(),
            '$' => {
                if next == Some('{') {
                    "\\$".to_string()
                } else {
                    "$".to_string()
                }
            }
            '\r' => "\\r".to_string(),
            '\n' | '\t' | '\x08' | '\x0B' | '\x0C' => curr.to_string(), // \b, \v, \f
            c if (c as u32) <= 0x7E => c.to_string(), // ASCII
            c if is_xid_continue(c) => c.to_string(),
            c => {
                let s = c.to_string();
                let json = serde_json::to_string(&s).unwrap();
                if json.len() > 4 {
                    json[1..json.len() - 1].to_string()
                } else {
                    s
                }
            }
        };

        if self.next_char.is_none() {
            self.finished = true;
            Some(out + "`")
        } else {
            Some(out)
        }
    }
}


pub fn escape_js_string_iter<'a>(input: &'a str) -> impl Iterator<Item = String> + 'a {
    struct EscapeJsString<'a> {
        chars: Chars<'a>,
        started: bool,
        finished: bool,
        next_char: Option<char>,
    }

    impl<'a> Iterator for EscapeJsString<'a> {
        type Item = String;

        fn next(&mut self) -> Option<Self::Item> {
            if !self.started {
                self.started = true;
                self.next_char = self.chars.next();
                return Some("`".to_string());
            }

            if self.finished {
                return None;
            }

            let curr = self.next_char?;
            self.next_char = self.chars.next();

            let next = self.next_char;

            let out = match curr {
                '\\' => "\\\\".to_string(),
                '`' => "\\`".to_string(),
                '$' => {
                    if next == Some('{') {
                        "\\$".to_string()
                    } else {
                        "$".to_string()
                    }
                }
                '\r' => "\\r".to_string(),
                '\n' | '\t' | '\x08' | '\x0B' | '\x0C' => curr.to_string(), // \b, \v, \f
                c if c as u32 <= 0x7E => c.to_string(), // ASCII
                c if unicode_ident::is_xid_continue(c) => c.to_string(),
                c => {
                    let s = c.to_string();
                    let json = serde_json::to_string(&s).unwrap(); // includes surrounding quotes
                    if json.len() > 4 {
                        json[1..json.len() - 1].to_string()
                    } else {
                        s
                    }
                }
            };

            if self.next_char.is_none() {
                self.finished = true;
                Some(out + "`")
            } else {
                Some(out)
            }
        }
    }

    EscapeJsString {
        chars: input.chars(),
        started: false,
        finished: false,
        next_char: None,
    }
}


fn main() {
    
    println!("Hello from Rust nightly!");
}
