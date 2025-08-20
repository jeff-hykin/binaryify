{
    description = "My Project";
    inputs = {
        nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
        # nixpkgs.url = "github:NixOS/nixpkgs/6f884c2#nodejs-slim";
        # nixpkgsWithPython38.url = "https://github.com/NixOS/nixpkgs/archive/9108a20782535741433c304f6a4376cb8b364b89.tar.gz";
        # nixpkgsWithNodejs18.url = "https://github.com/NixOS/nixpkgs/archive/a71323f68d4377d12c04a5410e214495ec598d4c.tar.gz";
        # nixpkgsWithRuby.url = "https://github.com/NixOS/nixpkgs/archive/ebf88190cce9a092f9c7abe195548057a0273e51.tar.gz";
        home-manager.url = "github:nix-community/home-manager/release-25.05";
        home-manager.inputs.nixpkgs.follows = "nixpkgs";
        xome.url = "github:jeff-hykin/xome";
        xome.inputs.nixpkgs.follows = "nixpkgs";
        xome.inputs.home-manager.follows = "home-manager";
        rust-overlay.url = "github:oxalica/rust-overlay";
    };
    outputs = { self, nixpkgs, xome, rust-overlay, ... }:
        xome.superSimpleMakeHome { inherit nixpkgs; pure = true; } ({system, ...}:
            let
                pkgs = import nixpkgs {
                    system = system;
                    overlays = [
                        (import rust-overlay)
                    ];
                    config = {
                        allowUnfree = true;
                        allowInsecure = true;
                        permittedInsecurePackages = [
                            # "python-2.7.18.8"
                            # "openssl-1.0.2u"
                        ];
                    };
                };
                # pkgsWithPython38 = import nixpkgsWithPython38 setup;
            in
                {
                    # for home-manager examples, see: https://deepwiki.com/nix-community/home-manager/5-configuration-examples
                    # all home-manager options: https://nix-community.github.io/home-manager/options.xhtml
                    home.homeDirectory = "/tmp/virtual_homes/xome_simple";
                    home.stateVersion = "25.05";
                    home.packages = [
                        # vital stuff
                        pkgs.coreutils-full
                        
                        # optional stuff
                        pkgs.bash
                        pkgs.gnugrep
                        pkgs.findutils
                        pkgs.wget
                        pkgs.curl
                        pkgs.unixtools.locale
                        pkgs.unixtools.more
                        pkgs.unixtools.ps
                        pkgs.unixtools.getopt
                        pkgs.unixtools.ifconfig
                        pkgs.unixtools.hostname
                        pkgs.unixtools.ping
                        pkgs.unixtools.hexdump
                        pkgs.unixtools.killall
                        pkgs.unixtools.mount
                        pkgs.unixtools.sysctl
                        pkgs.unixtools.top
                        pkgs.unixtools.umount
                        pkgs.git
                        
                        # project specific
                        pkgs.jq
                        pkgs.rust-bin.nightly."2024-07-01".default
                        pkgs.pkg-config
                        pkgs.openssl
                        pkgs.cargo-watch
                    ];
                    
                    programs = {
                        home-manager = {
                            enable = true;
                        };
                        zsh = {
                            enable = true;
                            enableCompletion = true;
                            autosuggestion.enable = true;
                            syntaxHighlighting.enable = true;
                            shellAliases.ll = "ls -la";
                            history.size = 100000;
                            # this is kinda like .zshrc
                            initContent = ''
                                # this enables some impure stuff like sudo, comment it out to get FULL purity
                                # export PATH="$PATH:/usr/bin/"
                            '';
                        };
                        starship = {
                            enable = true;
                            enableZshIntegration = true;
                        };
                    };
                }
        );
}