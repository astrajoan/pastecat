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

Initialize user profile:

```
$ pastecat init
```

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

## Contributors

<a href="https://github.com/astrajoan/pastecat/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=astrajoan/pastecat" />
</a>

Made with [contrib.rocks](https://contrib.rocks).
