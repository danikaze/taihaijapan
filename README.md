# Taihai Japan

[![Build Status](https://travis-ci.org/danikaze/taihaijapan.svg?branch=master)](https://travis-ci.org/danikaze/taihaijapan)

[Taihai Japan](https://taihaijapan.com) is a photography project by [@danikaze](https://twitter.com/danikaze) and this is the source code for the gallery of that site.

Feel free to fork it and customize it to create your own JavaScript/NodeJS based gallery ;)

* [Planned roadmap](https://github.com/danikaze/taihaijapan/issues)
* [Changelog](./CHANGELOG.md)

## Developing in Windows

Since there are some bash scripts...

* Git Bash is recommended.
* [rsync](http://www2.futureware.at/~nickoe/msys2-mirror/msys/x86_64/rsync-3.1.3-1-x86_64.pkg.tar.xz) and [pkill](http://www2.futureware.at/~nickoe/msys2-mirror/msys/x86_64/procps-3.2.8-2-x86_64.pkg.tar.xz) are used in the building process. Download them and put their binaries under `C:\Program Files\Git\usr\bin`.

Because `bcrypt` needs to be compiled using gyp...
* [Python 2.x](https://www.python.org/downloads/release/python-2715/) is required.
* `npm install -g --production windows-build-tools` (it will take a while...)
