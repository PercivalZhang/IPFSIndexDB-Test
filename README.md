# IPFSIndexDB API Test

(https://aaachain.net/)

IPFSIndexDB is designed to a decentralized db service build on IPFS which privides more clear, managable and convenient data management features to end users.

  - searchable
  - editable
  - decentralized
  - multiple chains support: eos, eth

# Test Code

  - Metadata Service Interface Test - MetadataService.test.js
  - File Service Interface Test - FileService.test.js
  - Http Rest API Test - api.test.js

### Main Modules

Test code and doc use a number of open source projects to work properly:

* [mocha](https://mochajs.org/) - feature-rich JavaScript test framework!
* [chai](chaijs.com) - an assertion library
* [node.js] - evented I/O for the backend
* [apiDoc](http://apidocjs.com/) - Generates a RESTful web API Documentation
* [Gulp] - the streaming build system

### npm script set
Dillinger is very easy to install and deploy in a Docker container.

```sh
"test": "mocha --require babel-polyfill --require babel-register dist/test/"
```
### npm run test

```sh
npm test
```

### Todos

 - Write more Tests
 - Keep updating api doc

License
----

**Free Software, Hell Yeah!**
