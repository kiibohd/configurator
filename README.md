# The Kiibohd Configurator

Client Side Configuration & Flashing Software for Kiibohd compatible keyboards.

[![Travis Status](https://travis-ci.org/kiibohd/configurator.svg?branch=master)](https://travis-ci.org/kiibohd/configurator) [![Appveyor Status](https://ci.appveyor.com/api/projects/status/keu6at9jdrlvd1g5/branch/master?svg=true)](https://ci.appveyor.com/project/kiibohd/configurator/branch/master)


[![Visit our IRC channel](https://kiwiirc.com/buttons/irc.freenode.net/input.club.png)](https://kiwiirc.com/client/irc.freenode.net/#input.club)

[Visit our Discord Channel](https://discord.gg/GACJa4f)



## Supported Keyboards

* Infinity 60%
* Infinity 60% LED
* Infinity Ergodox
* WhiteFox/NightFox
* K-Type

## Dependencies

### Windows

You will need to install Zadig drivers & download dfu-util (TODO: Updated Install Instruction link)

### Linux

* Install dfu-util from your disto's package manager.
* Add the following to /etc/udev/rules.d/60-input-club.rules (You will need to create the new file)
  ```bash
  # UDEV Rules for Input Club keyboards
  #
  # This will allow reflashing via dfu-util without using sudo
  #
  # This file must be placed /at /etc/udev/rules.d/60-input-club.rules  (preferred location)
  
  # Board
  SUBSYSTEMS=="usb", ATTRS{idVendor}=="1c11", ATTRS{idProduct}=="b04d", MODE="664", GROUP="plugdev"
  # Boot
  SUBSYSTEMS=="usb", ATTRS{idVendor}=="1c11", ATTRS{idProduct}=="b007", MODE="664", GROUP="plugdev"
  # Registered Board
  SUBSYSTEMS=="usb", ATTRS{idVendor}=="1209", ATTRS{idProduct}=="01c0", MODE="664", GROUP="plugdev"
  # Registered Boot
  SUBSYSTEMS=="usb", ATTRS{idVendor}=="1209", ATTRS{idProduct}=="01cb", MODE="664", GROUP="plugdev"
  ```


## Installation

### macOS

Install via brew cask (this will automatically install the dfu-util dependency)

```bash
$ brew tap caskroom/drivers
$ brew cask install kiibohd-configurator
```

### Other operating systems

Download the installer/binary for your platform from the [latest release](https://github.com/kiibohd/configurator/releases/latest)


## Compilation

Only required if there is no release for your distribution.

NOTE: If you perform a `build:dev` you will also need to run [KiiConf](https://github.com/kiibohd/KiiConf) locally.


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
