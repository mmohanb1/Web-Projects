import { ok, err } from 'cs544-js-utils';

/** return pair [label, index] (wrapped within a Result) of the
 *  training LabeledFeatures trainLabeledFeatures having the most
 *  common label of the k training features closest to subject
 *  testFeatures.
 *
 *  Errors:
 *    BAD_FMT: trainLabeledFeatures has features bytes with length 
 *             different from length of subject testFeatures.
 */
export default function  knn(testFeatures, trainLabeledFeatures, k=3) {
//console.log('trainLabeledFeatures[0].label[0] : '+(typeof trainLabeledFeatures[0].label[0]));

var distLabelIndexes = new Array();
var dist = 0;
for(var i=0; i<trainLabeledFeatures.length; i++)
{
	if(trainLabeledFeatures[i].features.length != testFeatures.length){
//	console.log('Test and Training image # of bytes dont match');
	    return err('Test and Training image # of bytes dont match', { code: 'BAD_FMT' });
	    }

	for(var j=0; j<trainLabeledFeatures[i].features.length; j++)
          dist = dist + Math.pow((trainLabeledFeatures[i].features[j]-testFeatures[j]), 2);

//const obj = {'d': dist, 'l': trainLabeledFeatures[i].label, 'i': i};

const obj = {dist: dist, label: trainLabeledFeatures[i].label[0], index: i};
//console.log('trainLabeledFeatures[i].label = '+new Label(trainLabeledFeatures[i].label));
//const obj = [dist,trainLabeledFeatures[i].label,i];
//console.log('obj.dist = '+obj.d+',obj.label = '+obj.l+', obj.index = '+obj.i);
//distLabelIndexes = distLabelIndexes.concat(obj);
distLabelIndexes.push(obj);
dist = 0;
}


distLabelIndexes = distLabelIndexes.sort((a,b) => a.dist-b.dist).slice(0,k);
//distLabelIndexes = distLabelIndexes.sort((a,b) => a[0]-b[0]).slice(0,k);
//Array.from(distLabelIndexes, (obj) => console.log('obj.dist = '+obj.d+',obj.label = '+obj.l+', obj.index = '+obj.i));

const map = new Map();
//var maxCount=0, maxLabel , maxIndex=0;
var maxCount=1, maxLabel=distLabelIndexes[0].label, maxIndex=0;
map.set(distLabelIndexes[0].label,1);
//for(var i=0; i<distLabelIndexes.length; i++)
for(var i=1; i<distLabelIndexes.length; i++)
{
  const la = distLabelIndexes[i].label;
//  const la = distLabelIndexes[i][1];
   if(map.has(la))
   {
     const c = map.get(la);
//console.log('*************la in map , la = '+la);
   if(maxCount < c+1)
   {
     maxCount = c+1;
     maxIndex = distLabelIndexes[i].index;
//     maxIndex = distLabelIndexes[i][2];
     maxLabel = la;
   }
      map.set(la, c+1);
   }
   else
    map.set(la, 1);
}
//console.log('****maxIndex:'+maxIndex+', maxLabel.length : '+maxLabel.length);
//console.log('****maxIndex:'+maxIndex+', maxLabel :'+maxLabel+'abc');
//const arr = [maxLabel,maxIndex];
const arr = new Array(maxLabel,maxIndex);
return {hasErrors: false, val: arr};
}
