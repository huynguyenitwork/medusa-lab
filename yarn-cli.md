[1m━━━ Yarn Package Manager - 3.2.1 ━━━━━━━━━━━━━━━━━━━━━━━━[38;5;256m━[38;5;255m━[38;5;254m━[38;5;253m━[38;5;252m━[38;5;251m━[38;5;250m━[38;5;249m━[38;5;248m━[38;5;247m━[38;5;246m━[38;5;245m━[38;5;244m━[38;5;243m━[38;5;242m━[38;5;241m━[38;5;240m━[38;5;239m━[38;5;238m━[38;5;237m━[38;5;236m━[38;5;235m━[38;5;234m━[38;5;233m━[0m

  [1m$ [22myarn <command>

[1m━━━ General commands ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[38;5;256m━[38;5;255m━[38;5;254m━[38;5;253m━[38;5;252m━[38;5;251m━[38;5;250m━[38;5;249m━[38;5;248m━[38;5;247m━[38;5;246m━[38;5;245m━[38;5;244m━[38;5;243m━[38;5;242m━[38;5;241m━[38;5;240m━[38;5;239m━[38;5;238m━[38;5;237m━[38;5;236m━[38;5;235m━[38;5;234m━[38;5;233m━[0m

  [1myarn add [--json] [-E,--exact] [-T,--tilde] [-C,--caret] [-D,--dev] [-P,--peer] [-O,--optional] [--prefer-dev] [-i,--interactive] [--cached] [--mode #0] ...[22m
    add dependencies to the project

  [1myarn bin [-v,--verbose] [--json] [name][22m
    get the path to a binary script

  [1myarn cache clean [--mirror] [--all][22m
    remove the shared cache files

  [1myarn config [-v,--verbose] [--why] [--json][22m
    display the current configuration

  [1myarn config get [--json] [--no-redacted] <name>[22m
    read a configuration settings

  [1myarn config set [--json] [-H,--home] <name> <value>[22m
    change a configuration settings

  [1myarn config unset [-H,--home] <name>[22m
    unset a configuration setting

  [1myarn dedupe [-s,--strategy #0] [-c,--check] [--json] [--mode #0] ...[22m
    deduplicate dependencies with overlapping ranges

  [1myarn dlx [-p,--package #0] [-q,--quiet] <command> ...[22m
    run a package in a temporary environment

  [1myarn exec <commandName> ...[22m
    execute a shell script

  [1myarn explain [--json] [code][22m
    explain an error code

  [1myarn explain peer-requirements [hash][22m
    explain a set of peer requirements

  [1myarn info [-A,--all] [-R,--recursive] [-X,--extra #0] [--cache] [--dependents] [--manifest] [--name-only] [--virtuals] [--json] ...[22m
    see information related to packages

  [1myarn init [-p,--private] [-w,--workspace] [-i,--install][22m
    create a new package

  [1myarn install [--json] [--immutable] [--immutable-cache] [--check-cache] [--inline-builds] [--mode #0][22m
    install the project dependencies

  [1myarn link [-A,--all] [-p,--private] [-r,--relative] <destination>[22m
    connect the local project to another one

  [1myarn node ...[22m
    run node with the hook already setup

  [1myarn npm audit [-A,--all] [-R,--recursive] [--environment #0] [--json] [--severity #0][22m
    perform a vulnerability audit against the installed packages

  [1myarn pack [--install-if-needed] [-n,--dry-run] [--json] [-o,--out #0][22m
    generate a tarball from the active workspace

  [1myarn patch [--json] <package>[22m
    prepare a package for patching

  [1myarn patch-commit [-s,--save] <patchFolder>[22m
    generate a patch out of a directory

  [1myarn rebuild ...[22m
    rebuild the project's native packages

  [1myarn remove [-A,--all] [--mode #0] ...[22m
    remove dependencies from the project

  [1myarn run [--inspect] [--inspect-brk] [-T,--top-level] [-B,--binaries-only] <scriptName> ...[22m
    run a script defined in the package.json

  [1myarn set resolution [-s,--save] <descriptor> <resolution>[22m
    enforce a package resolution

  [1myarn set version [--only-if-needed] <version>[22m
    lock the Yarn version used by the project

  [1myarn set version from sources [--path #0] [--repository #0] [--branch #0] [--plugin #0] [--no-minify] [-f,--force] [--skip-plugins][22m
    build Yarn from master

  [1myarn unlink [-A,--all] ...[22m
    disconnect the local project from another one

  [1myarn unplug [-A,--all] [-R,--recursive] [--json] ...[22m
    force the unpacking of a list of packages

  [1myarn up [-i,--interactive] [-E,--exact] [-T,--tilde] [-C,--caret] [-R,--recursive] [--mode #0] ...[22m
    upgrade dependencies across the project

  [1myarn why [-R,--recursive] [--json] [--peers] <package>[22m
    display the reason why a package is needed

[1m━━━ Interactive commands ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[38;5;256m━[38;5;255m━[38;5;254m━[38;5;253m━[38;5;252m━[38;5;251m━[38;5;250m━[38;5;249m━[38;5;248m━[38;5;247m━[38;5;246m━[38;5;245m━[38;5;244m━[38;5;243m━[38;5;242m━[38;5;241m━[38;5;240m━[38;5;239m━[38;5;238m━[38;5;237m━[38;5;236m━[38;5;235m━[38;5;234m━[38;5;233m━[0m

  [1myarn search[22m
    open the search interface

  [1myarn upgrade-interactive[22m
    open the upgrade interface

[1m━━━ Npm-related commands ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[38;5;256m━[38;5;255m━[38;5;254m━[38;5;253m━[38;5;252m━[38;5;251m━[38;5;250m━[38;5;249m━[38;5;248m━[38;5;247m━[38;5;246m━[38;5;245m━[38;5;244m━[38;5;243m━[38;5;242m━[38;5;241m━[38;5;240m━[38;5;239m━[38;5;238m━[38;5;237m━[38;5;236m━[38;5;235m━[38;5;234m━[38;5;233m━[0m

  [1myarn npm info [-f,--fields #0] [--json] ...[22m
    show information about a package

  [1myarn npm login [-s,--scope #0] [--publish][22m
    store new login info to access the npm registry

  [1myarn npm logout [-s,--scope #0] [--publish] [-A,--all][22m
    logout of the npm registry

  [1myarn npm publish [--access #0] [--tag #0] [--tolerate-republish] [--otp #0][22m
    publish the active workspace to the npm registry

  [1myarn npm tag add <package> <tag>[22m
    add a tag for a specific version of a package

  [1myarn npm tag list [--json] [package][22m
    list all dist-tags of a package

  [1myarn npm tag remove <package> <tag>[22m
    remove a tag from a package

  [1myarn npm whoami [-s,--scope #0] [--publish][22m
    display the name of the authenticated user

[1m━━━ Plugin-related commands ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[38;5;256m━[38;5;255m━[38;5;254m━[38;5;253m━[38;5;252m━[38;5;251m━[38;5;250m━[38;5;249m━[38;5;248m━[38;5;247m━[38;5;246m━[38;5;245m━[38;5;244m━[38;5;243m━[38;5;242m━[38;5;241m━[38;5;240m━[38;5;239m━[38;5;238m━[38;5;237m━[38;5;236m━[38;5;235m━[38;5;234m━[38;5;233m━[0m

  [1myarn plugin import <name>[22m
    download a plugin

  [1myarn plugin import from sources [--path #0] [--repository #0] [--branch #0] [--no-minify] [-f,--force] <name>[22m
    build a plugin from sources

  [1myarn plugin list [--json][22m
    list the available official plugins

  [1myarn plugin remove <name>[22m
    remove a plugin

  [1myarn plugin runtime [--json][22m
    list the active plugins

[1m━━━ Workspace-related commands ━━━━━━━━━━━━━━━━━━━━━━━━━━[38;5;256m━[38;5;255m━[38;5;254m━[38;5;253m━[38;5;252m━[38;5;251m━[38;5;250m━[38;5;249m━[38;5;248m━[38;5;247m━[38;5;246m━[38;5;245m━[38;5;244m━[38;5;243m━[38;5;242m━[38;5;241m━[38;5;240m━[38;5;239m━[38;5;238m━[38;5;237m━[38;5;236m━[38;5;235m━[38;5;234m━[38;5;233m━[0m

  [1myarn workspace <workspaceName> <commandName> ...[22m
    run a command within the specified workspace

  [1myarn workspaces focus [--json] [--production] [-A,--all] ...[22m
    install a single workspace and its dependencies

  [1myarn workspaces foreach [-R,--recursive] [--from #0] [-A,--all] [-v,--verbose] [-p,--parallel] [-i,--interlaced] [-j,--jobs #0] [-t,--topological] [--topological-dev] [--include #0] [--exclude #0] [--no-private] [--since] <commandName> ...[22m
    run a command on all workspaces

  [1myarn workspaces list [--since] [-R,--recursive] [-v,--verbose] [--json][22m
    list all available workspaces

You can also print more details about any of these commands by calling them with 
the [36m`-h,--help`[39m flag right after the command name.
