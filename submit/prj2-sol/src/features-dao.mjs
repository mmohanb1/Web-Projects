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

async close(){
MongoClient.close();
console.log('connection closed.');

}	// close of function close()
} //close of class
//console.log('In makeFeaturesDao');
//  return err('unimplemented makeFeaturesDao()', { code: 'UNIMP' });
//setup();
const obj = await FeaturesDao.setup();
console.log('after calling setup');
return {hasErrors: false, val: obj};
}



