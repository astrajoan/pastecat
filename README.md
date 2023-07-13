# PasteCat

Visit our live website at [https://pastecat.io](https://pastecat.io)

## Development

**NOTE:** Please make sure to have `config.js` with Firebase API key ready in
the root directory of this repository in order to build/run any applications! 

## CLI tool usage

### Installation
To install the cli package, run:

```
$ cd cli && sudo ./install.sh
```

### Examples
To get a paste with pasteId:

```
$ pastecat get <pasteId>
```

To generate a new pastecat with local file:

```
$ pastecat store <filepath>
```

To generate new pastecat with stdout:

```
$ echo <output> | pastecat store
```
