# nearley-dev-conf
IoT Config File using Nearley parser

Refer https://blog.humminglab.io/posts/nearley-builder-and-loader/

## Build parser

* Compile parse with nearleyc

```shell
$ cd builder
$ npm install 
$ npm install -g nearley
$ nearleyc parse.ne -o parser.js 
```

* Test parser 

```shell
$ cat input/test.conf | nearley-test parser.js
```

* Run builder 

```shell
$ node index.js input/test.conf output.bin 
```

## Loader 

* Compile loader 

```shell
$ cd loader 
$ gcc -o loader loader.c 
```

* Test loader 

```shell
$ loader ../builder/output.bin
```
