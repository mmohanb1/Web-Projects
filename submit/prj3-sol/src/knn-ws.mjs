import cors from 'cors';
import express from 'express';
import bodyparser from 'body-parser';
import assert from 'assert';
import STATUS from 'http-status';

import { ok, err } from 'cs544-js-utils';
import { knn } from 'prj1-sol';

import { uint8ArrayToB64, b64ToUint8Array } from 'prj2-sol';

import fs from 'fs';
import http from 'http';
import https from 'https';

export const DEFAULT_COUNT = 5;

/** Start KNN server.  If trainData is specified, then clear dao and load
 *  into db before starting server.  Return created express app
 *  (wrapped within a Result).
 *  Types described in knn-ws.d.ts
 */
export default async function serve(knnConfig, dao, data) {
  try {
   // const app = express();

    //TODO: squirrel away knnConfig params and dao in app.locals.
    const app = express();
    app.locals.dao = dao;
    app.locals.base = knnConfig.base;
    app.locals.k = knnConfig.k;
//    console.log(data.length);
 //       console.log(data);
 //   console.log(`app.locals.k = ${app.locals.k}`);
    if (data) {
       dao.clear();
      //TODO: load data into dao
      for(const lf of data)
      {
//      console.log(`lf = ${lf.features} ------------ ${lf.label}`);
	const id = await dao.add(lf.features, false, lf.label);	
      }
      
    }

    //TODO: get all training results from dao and squirrel away in app.locals
    app.locals.training_images = await dao.getAllTrainingFeatures();
//  console.log(`app.locals.training_images.val = ${app.locals.training_images.val}`);
    //set up routes
    setupRoutes(app);

    return ok(app);
  }
  catch (e) {
    return err(e.toString(), { code: 'INTERNAL' }); 
  }
}


function setupRoutes(app) {
  const base = app.locals.base;
  app.use(cors({exposedHeaders: 'Location'}));
  app.use(express.json({strict: false})); //false to allow string body
  //app.use(express.text());

  //uncomment to log requested URLs on server stderr
  //app.use(doLogRequest(app));
//  console.log(`base = ${base}/images`);
 // console.log('in setup routes');
  app.post(`${base}/images`, doPostTestImage(app));
  app.get(`${base}/images/:id`, doGetTestImage(app));
  app.get(`${base}/labels/:testId`, doKnn(app));
  
  
  //TODO: add knn routes here

  //must be last
  app.use(do404(app));
  app.use(doErrors(app));
}

function doPostTestImage(app) {
  return (async function(req, res) {
    try {
      const testImage = req.body;
      const result = await app.locals.dao.add(testImage, true);
      if (result.hasErrors) throw result;
      const featureId = result.val;
//      const { id } = featureId;
	
      //return {id: featureId};
     // res.location(selfLink(req, id));
//      res.status(STATUS.CREATED).json(selfResult(req, featureId, 'POST'));
      res.json({id: featureId});
    }
    catch(err) {
      const mapped = mapResultErrors(err);
      res.status(mapped.status).json(mapped);
    }
  });
}
function doGetTestImage(app) {
  return (async function(req, res) {
    try {
 //   console.log(req.params.id);
      const result = await app.locals.dao.get(req.params.id, true);
      if (result.hasErrors) throw result;
//      const features = result.features;
//console.log(result);
      res.json({features: result.val.features, label: result.val.label});
      //res.location(userId);
//      res.json(selfResult(req, result.val));
    }
    catch(err) {
      const mapped = mapResultErrors(err);
      res.status(mapped.status).json(mapped);
    }
  });
}
function doKnn(app) {
  return (async function(req, res) {
    try {
//   console.log(`req.query.k = ${req.query.k}`);
      const result = await app.locals.dao.get(req.params.testId, false);
      if (result.hasErrors) throw result;
      if(req.query.k)
	app.locals.k = req.query.k;
      const testFeatures = result.val.features;
   //   console.log(`testFeatures = ${testFeatures}`);
      const trainingFeatures = app.locals.training_images.val;
      for(const trainingF of trainingFeatures)
      {
//	console.log(`trainingF.features = ${trainingF.features}`);
	if(trainingF.features.length !== testFeatures.length)
	   throw err('Test & Training # bytes dont match',{code: 'BAD_FMT'});
      }
    //  console.log(`trainingFeatures.length = ${trainingFeatures.length}`);
    //console.log(`app.locals.k = ${app.locals.k}`);
      const result1 = await knn(testFeatures, trainingFeatures, app.locals.k);
    //  console.log(`result1 index of knn = ${result1.val[1]}`);
      const trainingImageClosest = trainingFeatures[result1.val[1]];
//      console.log(`{id: ${trainingImageClosest.id}, label: ${trainingImageClosest.label}`);
//console.log(result);
      res.json({id: trainingImageClosest.id, label: trainingImageClosest.label});
      //res.location(userId);
//      res.json(selfResult(req, result.val));
    }
    catch(err) {
      const mapped = mapResultErrors(err);
      res.status(mapped.status).json(mapped);
    }
  });
}
//dummy handler to test initial routing and to use as a template
//for real handlers.  Remove on project completion.
function dummyHandler(app) {
  return (async function(req, res) {
    try {

      res.json({status: 'TODO'});
    }
    catch(err) {
      const mapped = mapResultErrors(err);
      res.status(mapped.status).json(mapped);
    }
  });
}

//TODO: add real handlers


/************************* HATEOAS Utilities ***************************/

/** Return original URL for req */
function requestUrl(req) {
  return `${req.protocol}://${req.get('host')}${req.originalUrl}`;
}

function selfLink(req, id=null) {
  const url = new URL(requestUrl(req));
  return url.pathname + (id ? `/${id}` : url.search);
}

function pageLink(req, nResults, dir) {
  const url = new URL(requestUrl(req));
  const count = Number(req.query?.count ?? DEFAULT_COUNT);
  const index0 = Number(url.searchParams.get('index') ?? 0);
  if (dir > 0 ? nResults <= count : index0 <= 0) return undefined;
  const index = dir > 0 ? index0 + count : count > index0 ? 0 : index0 - count;
  url.searchParams.set('index', index);
  url.searchParams.set('count', count);
  return url.pathname + url.search;
}

function selfResult(req, result, method=undefined) {
  return { result, _links: { self: { href: selfLink(req), method } } };
}


function pageResult(req, results) {
  const nResults = results.length;
  const result = results.map(r => {
    return { ...r, _links: { self: selfLink(req, r.userId) } };
  });
  const links = { self: { href: selfLink(req), } };
  const next = pageLink(req, nResults, +1);
  if (next) links.next = { href: next };
  const prev = pageLink(req, nResults, -1);
  if (prev) links.prev = { href: prev };
  const count = req.query.count ?? DEFAULT_COUNT;
  return { result: result.slice(0, count), _links: links };
}

/** Handler to log current request URL on stderr and transfer control
 *  to next handler in handler chain.
 */
function doLogRequest(app) {
  return (function(req, res, next) {
    console.error(`${req.method} ${req.originalUrl}`);
    next();
  });
}
  
/** Default handler for when there is no route for a particular method
 *  and path.
 */
function do404(app) {
  return async function(req, res) {
    const message = `${req.method} not supported for ${req.originalUrl}`;
    const result = {
      status: STATUS.NOT_FOUND,
      errors: [	{ options: { code: 'NOT_FOUND' }, message, }, ],
    };
    res.status(404).json(result);
  };
}

//function doBadFmt(app) {
 // return async function(req, res) {
   // const message = `Test & Training # bytes dont match`;
//    const result = {
//      status: STATUS.BAD_REQUEST,
  //    errors: [	{ options: { code: 'BAD_FMT' }, message, }, ],
//    };
//    res.status(STATUS.BAD_REQUEST).json(result);
//  };
//}



/** Ensures a server error results in nice JSON sent back to client
 *  with details logged on console.
 */ 
function doErrors(app) {
  return async function(err, req, res, next) {
    const message = err.message ?? err.toString();
    const result = {
      status: STATUS.INTERNAL_SERVER_ERROR,
      errors: [ { options: { code: 'INTERNAL' }, message } ],
    };
    res.status(STATUS.INTERNAL_SERVER_ERROR).json(result);
    console.error(result.errors);
  };
}

/*************************** Mapping Errors ****************************/

//map from domain errors to HTTP status codes.  If not mentioned in
//this map, an unknown error will have HTTP status BAD_REQUEST.
const ERROR_MAP = {
  EXISTS: STATUS.CONFLICT,
  NOT_FOUND: STATUS.NOT_FOUND,
  AUTH: STATUS.UNAUTHORIZED,
  DB: STATUS.INTERNAL_SERVER_ERROR,
  INTERNAL: STATUS.INTERNAL_SERVER_ERROR,

}

/** Return first status corresponding to first options.code in
 *  errors, but SERVER_ERROR dominates other statuses.  Returns
 *  BAD_REQUEST if no code found.
 */
function getHttpStatus(errors) {
  let status = null;
  for (const err of errors) {
    const errStatus = ERROR_MAP[err.options?.code];
    if (!status) status = errStatus;
    if (errStatus === STATUS.SERVER_ERROR) status = errStatus;
  }
  return status ?? STATUS.BAD_REQUEST;
}

/** Map domain/internal errors into suitable HTTP errors.  Return'd
 *  object will have a "status" property corresponding to HTTP status
 *  code.
 */
function mapResultErrors(err) {
  const errors = err.errors ?? [ { message: err.message ?? err.toString() } ];
  const status = getHttpStatus(errors);
  if (status === STATUS.INTERNAL_SERVER_ERROR)  console.error(errors);
  return { status, errors, };
} 
