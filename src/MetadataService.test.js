'use strict';

import chai from 'chai';
import mongoose from "mongoose";
import Config from '../../config/config';
import { MetadataService } from '../service/MetadataService';

const expect = chai.expect;
const should = chai.should();
const mdb_url = "mongodb://" + Config.mongo.host + ":" + Config.mongo.port + "/test";

describe('.metadata (the Mongodb API part)', function () {
    //this.timeout(120 * 1000);
    before((done) => {
        mongoose.connect(mdb_url, { useNewUrlParser: true }).then(() => {
            done();
        }).catch(error => {
            should.not.exist(error);
        });
    });
    after((done) => {
        console.log('drop db');
        mongoose.connection.dropDatabase();
        done();
    });
    it('metadata.add', function (done) {
        const jsonData = {
            hashId: 'Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7u',
            size: 1234,
            publicKey: 'EOS7KbAB4UxjkSesb3oNYXkRDWHjsSQ2HW66cZwQuRRGYtq8ZSj2Y',
            account: 'mingqi',
            data: {
                name: '1.png',
                size: '443362',
                tag: 'cars'
            }
        };
        MetadataService.addNew(jsonData).then(metadata => {
            expect(metadata.hashId).to.equal(jsonData.hashId);
            metadata.should.have.property('_id');
            done();
        }).catch(error => {
            return done(error);
        });
    });
    it('metadata.find', function (done) {
        const jsonData = {
            hashId: 'Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7f',
            size: 234,
            publicKey: 'EOS7KbAB4UxjkSesb3oNYXkRDWHjsSQ2HW66cZwQuRRGYtq8ZSj2Y',
            account: 'mingqi',
            metadata: {
                name: '1.png',
                size: '443362',
                tag: 'building'
            }
        };
        MetadataService.addNew(jsonData).then(metadata => {
            should.exist(metadata);
            return MetadataService.find({ hashId: 'Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7f' }, 1, 10);
            //return metadataService.find({ 'data.tag': 'building' });
        }).then((result) => {
            result.should.have.property('docs');
            result.total.should.equal(1);
            result.page.should.equal(1);
            result.limit.should.equal(10);
            done();
        }).catch(error => {
            console.log(error);
            return done(error)
        });
    });
});
