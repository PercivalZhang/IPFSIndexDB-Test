'use strict';

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
        request.post({ url: 'http://localhost:3001/dbnode/file/add?chain=eos' , formData: formData }, function optionalCallback(err, httpResponse, body) {
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
            messageHash: signedMsg.messageHash,
            signature: signedMsg.signature,
            options: '{ "onlyHash": true }',
            file: readFileStream
        };
        request.post({ url: 'http://localhost:3001/dbnode/file/add?chain=ether' , formData: formData }, function optionalCallback(err, httpResponse, body) {
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
        const metadata = {"name": "profile.txt", "desc":"my profile", "location": "Beijing"};

        const bodyParams = {
            account: 'mingqi',
            metadata: metadata,
            signature: ecc.sign(JSON.stringify(metadata), eosPrivateKey),
            source: strSource,
            options: { onlyHash: true }
        };
        request.post({
            url: 'http://localhost:3001/dbnode/data/add?chain=eos',
            json: true,
            body: JSON.stringify(bodyParams) }, function optionalCallback(err, httpResponse, body) {
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
            metadata: metadata,
            messageHash: signedMsg.messageHash,
            signature: signedMsg.signature,
            source: strSource,
            options: { onlyHash: true }
        };
        request.post({
            url: 'http://localhost:3001/dbnode/data/add?chain=ether',
            json: true,
            body: JSON.stringify(bodyParams) }, function optionalCallback(err, httpResponse, body) {
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
            url: 'http://localhost:3001/dbnode/mine?chain=eos&page=1&pageSize=2&sortBy=timestamp',
            json:true, // tell http return json instead of string
            headers: {
                signature: sig,
                message: msg
        }}, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return done(err);
            }
            //console.log("response: ", JSON.stringify(body));
            body.should.have.property('docs');
            body.should.have.property('total');
            done();
        });
    });
    it('api.file.getMine > ether', function (done) {
        const msg = '{"page":1,"pageSize":30}';
        const signedMsg = web3.eth.accounts.sign(msg, ethPrivateKey);
        request.get({
            url: 'http://localhost:3001/dbnode/mine?chain=ether&page=1&pageSize=2&sortBy=timestamp',
            json:true, // tell http return json instead of string
            headers: {
                signature: signedMsg.signature,
                message: signedMsg.messageHash,
            }}, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return done(err);
            }
            //console.log("response: ", JSON.stringify(body));
            body.should.have.property('docs');
            body.should.have.property('total');
            body.page.should.equal(1);
            body.limit.should.equal(2);
            done();
        });
    });
    it('api.file.find', function (done) {
        const queryBody = {
            size: { $gte: 10},
            timestamp: { $gte: new Date(2018, 7, 10) },
            stringMatch: {
                'extra.desc': 'space'
            }
        };
        console.log(JSON.stringify({'name' : new RegExp('space', 'i')}));
        request.post({
            url: 'http://localhost:3001/dbnode/find?page=1&pageSize=20&sortBy=timestamp&order=1',
            json: true, // tell http return json instead of string
            body: JSON.stringify(queryBody) }, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return done(err);
            }
            //console.log("server response: ", JSON.stringify(body));
            body.should.have.property('docs');
            body.should.have.property('total');
            body.should.have.property('page');
            body.page.should.equal(1);
            body.limit.should.equal(20);
            done();
        });
    });
});
