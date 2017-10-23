# The Kiibohd Configurator

TODO - Description

[![Travis Status](https://travis-ci.org/kiibohd/configurator.svg?branch=master)](https://travis-ci.org/kiibohd/configurator) [![Appveyor Status](https://ci.appveyor.com/api/projects/status/keu6at9jdrlvd1g5/branch/master?svg=true)](https://ci.appveyor.com/project/kiibohd/configurator/branch/master)


[![Visit our IRC channel](https://kiwiirc.com/buttons/irc.freenode.net/input.club.png)](https://kiwiirc.com/client/irc.freenode.net/#input.club)

[Visit our Discord Channel](https://discord.gg/GACJa4f)



## Supported Keyboards

* Infinity 60%
* Infinity 60% LED
* Infinity Ergodox
* WhiteFox/NightFox
* K-Type



## Compilation

TODO - Description


### Requirements

* node 8.7 
* jdk 1.8
* [boot 2.7.2](https://github.com/boot-clj/boot)


### Linux

* libudev-dev
* build-essential

```bash
npm install
npm run build:prod
npm start
```


### macOS

* libusb

```bash
npm install
CXX=clang++ npm run build:prod
npm start
```


### Windows

* [chocolatey](https://chocolatey.org/)

__Setup__
```bash
# In Administrator shell
choco feature enable -n allowGlobalConfirmation
choco install python python2 nodejs boot-clj
```

```bash
npm install
npm run build:prod
npm start
```

