import { MongoClient } from 'mongodb';

import { ok, err } from 'cs544-js-utils';

import { b64ToUint8Array, uint8ArrayToB64 } from './uint8array-b64.mjs';


export default async function makeFeaturesDao(dbUrl) {

 class FeaturesDao{
 //static c = 0;
 static async setup(){
  //source to below code : w3schools.com
  console.log('in setup, url = '+dbUrl);
  //MongoClient = require('mongodb').MongoClient;
  console.log('in makeFeaturesDao');
  MongoClient.connect(dbUrl, function(err, db) {
  if (err)
  {
	//handle error here
	console.log('error');
  }
  console.log("Database created!");
    }
  )

    return new FeaturesDao();

 }//close of func setup

async close(obj){
MongoClient.close();
console.log('connection closed.');

}	// close of function close()

async add(features, label)
{
console.log('In add****');
console.log('features => '+features);
const b64 = uint8ArrayToB64(features);
console.log('b64 => '+b64);
const generator = await idGenerator();
console.log('generator => '+generator);
const featuresId = 'featuresData_'+generator.next().value;
console.log('featuresId => '+featuresId);
const obj = {id: featuresId, data: b64, label: label};
  console.log('obj => '+obj);
  db.featuresCollection.insertOne(obj);

  return {hasErrors: false, val: featuresId};
}//close of add func

async * idGenerator(){
let i = 1;
while(true)
   yield i++;
}//end of idgenerator

} //close of class
//console.log('In makeFeaturesDao');
//  return err('unimplemented makeFeaturesDao()', { code: 'UNIMP' });
//setup();
const obj = await FeaturesDao.setup();
console.log('after calling setup');
return {hasErrors: false, val: obj};
}



