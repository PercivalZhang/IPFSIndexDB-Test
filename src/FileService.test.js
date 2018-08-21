'use strict';

import fs from 'fs';
import path from 'path';
import chai from 'chai';
import ipfsCtl from '../ipfs/IPFSFactory';
import { fileService } from '../service/FileService';

const expect = chai.expect;
const should = chai.should();

describe('.files (the MFS API part)', function () {
    this.timeout(120 * 1000);
    let ipfsd;
    before((done) => {
        ipfsCtl.spawn({ initOptions: { bits: 1024 } }, (err, _ipfsd) => {
            should.not.exist(err);
            ipfsd = _ipfsd;
            console.log(_ipfsd.apiAddr);
            // reset ipfs connection to the one just spawned
            fileService.resetConnect(_ipfsd.apiAddr);
            done();
        });
    });
    after((done) => {
        if (!ipfsd) return done();
        ipfsd.stop(done)
    });
    const bufferJPG = fs.readFileSync(path.resolve(__dirname, '../../resource/cat.jpg'));
    const expectedBufferMultihash = 'Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7u';

    it('files.add with only-hash=true', function (done) {
        fileService.addFiles(bufferJPG, {onlyHash: true}).then(files => {
            //console.log(JSON.stringify(files));
            expect(files).to.have.length(1);
            expect(files[0].hash).to.equal(expectedBufferMultihash);
            done();
        }).catch(error => {
            console.log(error); //test
        })
    });
});
