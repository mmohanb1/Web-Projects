import { MongoClient } from 'mongodb';

import { ok, err } from 'cs544-js-utils';

import { b64ToUint8Array, uint8ArrayToB64 } from './uint8array-b64.mjs';


export default async function makeFeaturesDao(dbUrl) {
return FeaturesDao.make(dbUrl);
}

class FeaturesDao{
constructor(params) {  Object.assign(this, params); }

static async make(dbUrl) {
 const params = {};
    try {
      params._client = new MongoClient(dbUrl);
      await params._client.connect();
      const db = params._client.db();
      const features = db.collection(FEATURES_COLLECTION);
      params.features = features;
      await features.createIndex('featureId');
      params.count = await features.countDocuments();
      console.log('connected to db');
      return ok(new FeaturesDao(params));
    }
    catch (error) {
      return err(error.message, { code: 'DB' });
    }
    
 }//close of func make

async close(){
try{
await this._client.close();
}
catch(e){
err(error.message, { code: 'DB' });
}
}	// close of function close()

async add(features, isB64, label='')
{
console.log('In add****');
//console.log('features => '+features);
const b64 = isB64 ? features : uint8ArrayToB64(features);
//console.log('b64 => '+b64);

const featureId = await this.nextFeatureId();

//console.log('featureId => '+featureId);

const obj = {_id: featureId, isB64: isB64, features: b64, label: label};
try {
      const collection = this.features;
      const insertResult = await collection.insertOne(obj);
      const id1 = insertResult.insertedId;
      if (id1 !== featureId) {
	const msg = `expected inserted id '${id1}' to equal '${featureId}'`;
	return err(msg, {code: 'DB'});
      }
    }
    catch(e) {
      return err(e.message, { code: 'DB' });
    }
    return ok({hasErrors: false, val: featureId}.val);
}//close of add func

async get(featureId, isB64) {
    try {
      const collection = this.features;
      const dbEntry = await collection.findOne({_id: featureId});
   //   console.log('In Get, dbEntry => '+dbEntry);
      if (dbEntry) {
	const feature = { ...dbEntry };
	feature.features = !isB64 ? b64ToUint8Array(feature.features) : feature.features;
	feature.hasErrors = false;
  //    console.log('In Gets if condition******************');

	return ok(feature);
      }
      else {
	return err(`no feature for id '${featureId}'`, { code: 'NOT_FOUND' });
      }
    }
    catch (e) {
      return err(e.message, { code: 'DB' });
    }
  }
async getAllTrainingFeatures(){
     
try{
      const collection = this.features;

      const cursorArr = await collection.find({label: {$exists: true}, $expr: {$gt: [{$strLenCP: '$label'}, 0]}}).toArray();

      const newArr = new Array();
      console.log('cursorArr.length = '+cursorArr.length);
      console.log('In getAllTrainingFeatures....');
      for(var i=0; i<cursorArr.length; i++)
      {

	cursorArr[i].features = !cursorArr[i].isB64 ? b64ToUint8Array(cursorArr[i].features) : cursorArr[i].features;
	      console.log('cursorArr[i].features => '+cursorArr[i].features);
	newArr.push({features: cursorArr[i].features, label: cursorArr[i].label});
      }
      console.log('newArr.length = '+newArr.length);
      const obj = {};
      obj.hasErrors = false;
      obj.val = newArr;
    return ok(obj.val);
    }
    
        catch (e) {
      return err(e.message, { code: 'DB' });
      }
      
}
async nextFeatureId() {
    const query = { _id: NEXT_ID_KEY };
    const update = { $inc: { [NEXT_ID_KEY]: 1 } };
    const options = { upsert: true, returnDocument: 'after' };
    const ret =  await this.features.findOneAndUpdate(query, update, options);
    const seq = ret.value[NEXT_ID_KEY];
    return String(seq) + Math.random().toFixed(RAND_LEN).replace(/^0\./, '_');
  }

} //close of class

const FEATURES_COLLECTION = 'features';
const NEXT_ID_KEY = 'count';
const RAND_LEN = 2;




