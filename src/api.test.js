'use strict';

require('dotenv').config();

import fs from 'fs';
import Web3 from 'web3';
import path from 'path';
import chai from 'chai';
import request from 'request';
import ecc from 'eosjs-ecc';

const web3 = new Web3();
const expect = chai.expect;
const should = chai.should();
const ethPrivateKey = '0x04f60ce3d41707bf8907abff5e962c09a8bf4e35a571f4ee51984aace96c27f0';
const eosPrivateKey = '5K1ZE5seSS3PdxWHjXsRreqtTBEjMBPrL4WTke6Fe7jwf17rHKK';
const publicKey = ecc.privateToPublic(eosPrivateKey);


console.log("env.type: ", process.env.TYPE);
let sosnode_port = 3001;   // default to test port
if(process.env.TYPE === '1') { // product environment
    sosnode_port = 9527;
}
console.log("port: ", sosnode_port);

const host = '47.99.61.209';

describe('.apiRouter (files)', function () {
    this.timeout(120 * 1000);
    before((done) => {
        done();
    });
    after((done) => {
        done();
    });

    it('api.file.add > eos', function (done) {
        fs.writeFileSync(path.resolve(__dirname, '../../resource/test-file.txt'), new Date() + Math.random().toString(36).substring(8));
        const metadata = '{"name": "test.txt", "desc":"spaceX third launch", "location": "Kennedey"}';
        const readFileStream = fs.createReadStream(path.resolve(__dirname, '../../resource/test-file.txt'));

        const formData = {
            account: 'mingqi',
            metadata: metadata,
            signature: ecc.sign(metadata, eosPrivateKey),
            options: '{ "onlyHash": true }',
            file: readFileStream
        };
        request.post({ url: 'http://' + host +':' + sosnode_port + '/dbnode/file/add?chain=eos' , formData: formData }, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return done(err);
            }
            console.log("server response: ", body);
            body = JSON.parse(body);
            body.should.have.property('_id');
            done();
        });
    });
    it('api.file.add > ether', function (done) {
        fs.writeFileSync(path.resolve(__dirname, '../../resource/test-file.txt'), new Date() + Math.random().toString(36).substring(9));
        const metadata = '{"name": "test.txt", "desc":"spaceX third launch", "location": "Kennedey"}';
        const readFileStream = fs.createReadStream(path.resolve(__dirname, '../../resource/test-file.txt'));
        const signedMsg = web3.eth.accounts.sign(metadata, ethPrivateKey);
        const formData = {
            metadata: signedMsg.message,
            signature: signedMsg.signature,
            options: '{ "onlyHash": true }',
            file: readFileStream
        };
        request.post({ url: 'http://' + host +':'  + sosnode_port + '/dbnode/file/add?chain=ether' , formData: formData }, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return done(err);
            }
            console.log("server response: ", body);
            body = JSON.parse(body);
            body.should.have.property('_id');
            done();
        });
    });

    it('api.data.add > eos', function (done) {
        const strSource = '{"name":"wangpengpeng","gender":"male","age":28}' + Date.now() + Math.random().toString(36).substring(7);
        const metadata = {"name": "test.txt", "desc":"spaceX third launch", "location": "Kennedey"};

        const bodyParams = {
            "account": "mingqi",
            "metadata": metadata,
            "signature": ecc.sign(JSON.stringify(metadata), eosPrivateKey),
            "source": strSource,
            "options": { onlyHash: true }
        };
        console.log(JSON.stringify(bodyParams));
        request.post({
            url: 'http://' + host +':'  + sosnode_port + '/dbnode/data/add?chain=eos',
            json: true,
            body: bodyParams }, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return done(err);
            }
            console.log("server response: ", body);
            body.should.have.property('_id');
            done();
        });
    });

    it('api.data.add > ether', function (done) {
        const strSource = '{"name":"wangpengpeng","gender":"male","age":28}' + Date.now() + Math.random().toString(36).substring(7);
        const metadata = {"name": "profile.txt", "desc":"my profile", "location": "Beijing"};
        const web3 = new Web3();
        const signedMsg = web3.eth.accounts.sign(JSON.stringify(metadata), ethPrivateKey);
        const bodyParams = {
            "metadata": metadata,
            "signature": signedMsg.signature,
            "source": strSource,
            "options": { onlyHash: true }
        };
        request.post({
            url: 'http://' + host +':'  + sosnode_port + '/dbnode/data/add?chain=ether',
            json: true,
            body: bodyParams }, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return done(err);
            }
            console.log("server response: ", body);
            body.should.have.property('_id');
            done();
        });
    });


    it('api.file.getMine > eos', function (done) {
        const msg = '{"page":1,"pageSize":30}';
        let sig = ecc.sign(msg, eosPrivateKey);
        request.get({
            url: 'http://' + host +':'  + sosnode_port + '/dbnode/mine?chain=eos&page=1&pageSize=2&sortBy=timestamp',
            json:true, // tell http return json instead of string
            headers: {
                signature: sig,
                message: msg
        }}, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return done(err);
            }
            console.log("response: ", JSON.stringify(body));
            body.should.have.property('docs');
            body.should.have.property('total');
            body.total.should.not.equal(0);
            done();
        });
    });

    it('api.file.getMine > ether', function (done) {
        const msg = {"page":1,"pageSize":30};
        const signedMsg = web3.eth.accounts.sign(JSON.stringify(msg), ethPrivateKey);
        //console.log(signedMsg)
        request.get({
            url: 'http://' + host +':'  + sosnode_port + '/dbnode/mine?chain=ether&page=1&pageSize=2&sortBy=timestamp',
            json: true, // tell http return json instead of string
            headers: {
                signature: signedMsg.signature,
                message: JSON.stringify(msg),
            }}, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return done(err);
            }
            console.log("response: ", JSON.stringify(body));
            body.should.have.property('docs');
            body.should.have.property('total');
            body.total.should.not.equal(0);
            body.page.should.equal(1);
            body.limit.should.equal(2);
            done();
        });
    });

    it('api.file.getMyDashboard > ether', function (done) {
        const msg = {"page":1,"pageSize":30};
        const signedMsg = web3.eth.accounts.sign(JSON.stringify(msg), ethPrivateKey);
        //console.log(signedMsg);
        request.get({
            url: 'http://' + host +':'  + sosnode_port + '/dbnode/dashboard?chain=ether&page=1&pageSize=2&sortBy=timestamp',
            json: true, // tell http return json instead of string
            headers: {
                signature: signedMsg.signature,
                message: JSON.stringify(msg),
            }}, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return done(err);
            }
            console.log("response: ", JSON.stringify(body));
            expect(body).to.have.lengthOf(1);
            body[0].should.have.property('totalSize');
            body[0].totalSize.should.not.equal(0);
            done();
        });
    });
    it('api.file.find', function (done) {
        const queryBody = {
            "size": { $gte: 10},
            "timestamp": { $gte: new Date(2018, 7, 10) },
            "stringMatch": {
                "extra.desc": "space"
            }
        };
        request.post({
            url: 'http://' + host +':'  + sosnode_port + '/dbnode/find?page=1&pageSize=2&sortBy=timestamp&order=1',
            json: true, // tell http return json instead of string
            body: queryBody }, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return done(err);
            }
            console.log("server response: ", JSON.stringify(body));
            body.should.have.property('docs');
            body.should.have.property('total');
            body.should.have.property('page');
            body.total.should.not.equal(0);
            body.page.should.equal(1);
            body.limit.should.equal(2);
            done();
        });
    });
    it('api.file.update > ether', function (done) {
        const web3 = new Web3();
        const msg = {"page":1,"pageSize":30};
        let signedMsg = web3.eth.accounts.sign(JSON.stringify(msg), ethPrivateKey);
        //console.log(signedMsg)
        request.get({
            url: 'http://' + host +':'  + sosnode_port + '/dbnode/mine?chain=ether&page=1&pageSize=2&sortBy=timestamp',
            json: true, // tell http return json instead of string
            headers: {
                signature: signedMsg.signature,
                message: JSON.stringify(msg),
            }}, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return done(err);
            }
            console.log("server response: ", JSON.stringify(body));
            const extra = {"desc":"i don't want you"};
            signedMsg = web3.eth.accounts.sign(JSON.stringify(extra), ethPrivateKey);
            const bodyParams = {
                "extra": extra,
                "signature": signedMsg.signature,
            };
            request.post({
                url: 'http://' + host +':'  + sosnode_port + '/dbnode/' + body.docs[0].hashId + '?chain=ether',
                json: true,
                body: bodyParams }, function optionalCallback(err, httpResponse, body) {
                if (err) {
                    return done(err);
                }
                console.log("server response: ", JSON.stringify(body));
                body.should.have.property('_id');
                body.extra.desc.should.equal("i don't want you");
                done();
            });
        });
    });
});
