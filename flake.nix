{
  description = "Development and deployment environment for Invite Rewards using Docker";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in {
        devShell = pkgs.mkShell {
          buildInputs = [
            pkgs.nodejs_20
            pkgs.nodePackages.npm
            pkgs.nodePackages.typescript
            pkgs.jq
            pkgs.docker
            pkgs.docker-compose
          ];
        };
      });
}
