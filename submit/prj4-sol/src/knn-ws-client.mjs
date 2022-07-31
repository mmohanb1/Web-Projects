import { ok, err } from 'cs544-js-utils';

export default function makeKnnWsClient(wsUrl) {
  return new KnnWsClient(wsUrl);
}

class KnnWsClient {

  constructor(wsUrl) {
    //TODO
    console.log('constructor called, url = '+wsUrl);
    this.wsUrl = wsUrl;
    this.result = {};
//    this.r = '';
//    this.reponse
  }

  /** Given a base64 encoding b64Img of an MNIST compatible test
   *  image, use web services to return a Result containing at least
   *  the following properties:
   *
   *   `label`: the classification of the image.
   *   `id`: the ID of the training image "closest" to the test
   *         image.
   * 
   *  If an error is encountered then return an appropriate
   *  error Result.
   */
  async classify(b64Img) {
    //TODO
    console.log('classify called.., url = '+this.wsUrl);
//    try {
    const resObj = await fetch(this.wsUrl+'/knn/images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(b64Img)
    }).then((res) => {
    if(res.ok)
     {return res.json()}
     throw new Error('Fetch failed');
    }).catch((error) => {return err('fetch failed', {code: 'BAD_REQUEST'})});
    if(resObj.hasErrors){
    console.log('has errors*************')
     return err('fetch failed', {code: 'BAD_REQUEST'});
     }
    console.log(`resObj => ${resObj}`);
    console.log(`testId = ${resObj.id}`);
    
    const testId = resObj.id;
    const resultObj = await fetch(this.wsUrl+'/knn/labels/'+testId).then((res1) =>
    {
     if(res1.ok)
      {return res1.json()}
      throw new Error('fetch failed');
    }).catch((error) => {err('fetch failed', {code: 'BAD_REQUEST'})});
     if(resultObj.hasErrors){
     console.log(`has errors************`);
     return err('fetch failed', {code: 'BAD_REQUEST'});
     }
    console.log(`..........................${resultObj}`);
    return resultObj;
 //   }

  }

  /** Return a Result containing the base-64 representation of
   *  the image specified by imageId.  Specifically, the success
   *  return should be an object containing at least the following
   *  properties:
   *
   *   `features`:
   *     A base-64 representation of the retrieved image bytes.
   *   `label`:
   *     The label associated with the image (if any).
   *
   *  If an error is encountered then return an appropriate
   *  error Result.
   */
  async getImage(imageId) {
    //TODO
  }

  /** convert an erroneous JSON web service response to an error Result. */
  wsError(jsonRes) {
    return err(jsonRes.errors[0].message, jsonRes.errors[0].options);
  }

}

