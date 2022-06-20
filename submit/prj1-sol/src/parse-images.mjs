import { ok, err } from 'cs544-js-utils';

/** parse byte streams in imageBytes: { images: Uint8Array, labels:
 *  Uint8Array } as per imageSpecs { images: HeaderSpec[], labels:
 *  HeaderSpec[] } to return a list of LabeledFeatures (wrapped within
 *  a Result).
 *
 *  Errors:
 *    BAD_VAL: value in byte stream does not match value specified
 *             in spec.
 *    BAD_FMT: size of bytes stream inconsistent with headers
 *             or # of images not equal to # of labels.
 */
export default function parseImages(imageSpecs, imageBytes) {
	const imageSpecImagesObj = imageSpecs.images;
	const imageSpecLabelsObj = imageSpecs.labels;
//	var errObj = {anyError: false, type: err};
//console.log('In parseImages');
		const headerMagicN = imageSpecImagesObj[0].value;
		const headerNImages = imageSpecImagesObj[1].value;
		const headerNRows = imageSpecImagesObj[2].value;
		const headerNCols = imageSpecImagesObj[3].value;
		const headerLabelMagicN = imageSpecLabelsObj[0].value;
//console.log('headerMagicN --> '+headerMagicN);
	const view = new DataView(imageBytes.images.buffer);

//console.log('images view -> '+view.byteLength);
	 if (view.getInt32(0) !== headerMagicN || view.getInt32(8) !== headerNRows || view.getInt32(12) !== headerNCols)
	   return err('***bad data in images detected!***', {code : 'BAD_VAL'});
	  //errObj = {anyError: true, type: err('***bad data in images detected!***', {code : 'BAD_VAL'})};
	   const imageBytesNImages = view.getInt32(4);
        	const view1 = new DataView(imageBytes.labels.buffer);
//console.log('labels view -> '+view1.byteLength);
		if (view1.getInt32(0) !== headerLabelMagicN)
	  	   return err('***bad data in labels detected***',{code : 'BAD_VAL'});
//	  errObj = {anyError: true, type: err('***bad data in labels detected!***', {code : 'BAD_VAL'})};

       	   const imageBytesNLabels = view1.getInt32(4);
//	console.log('imageBytesNLabels = '+imageBytesNLabels);
//	console.log('headerNRows = '+headerNRows);
//		console.log('imageBytesNImages = '+imageBytesNImages);
//		console.log('headerNCols = '+headerNCols);
//		console.log('imageBytes.images.length = '+imageBytes.images.length);
//		console.log('imageBytes.labels.length = '+imageBytes.labels.length);
	    if(imageBytesNImages !== imageBytesNLabels || (imageBytesNImages*headerNRows*headerNCols+16 !== imageBytes.images.length)
	    || (imageBytes.labels.length-8) !== imageBytesNLabels ||
	    ((imageBytes.images.length-16)/(headerNRows*headerNCols) != imageBytes.labels.length-8))
	    		 return err('detected inconstency in data',{code : 'BAD_FMT'});
		//errObj = {anyError: true, type: err('***detected inconstency in data!***', {code : 'BAD_FMT'})};

	   var labeledFeaturesFeatures = new Array() ;
   	   var labeledFeaturesLabel = new Array();

//	   for(var i=16; i<=imageBytes.images.length-4; i=i+4)
	   for(var i=16; i<=imageBytes.images.length-(headerNRows*headerNCols); i=i+(headerNRows*headerNCols))
//		   labeledFeaturesFeatures = labeledFeaturesFeatures.concat(imageBytes.images.slice(i, i+(headerNRows*headerNCols)));
                   labeledFeaturesFeatures.push(imageBytes.images.slice(i, i+headerNRows*headerNCols));
	   for(var i=8; i<=imageBytes.labels.length-1; i++){
//	       	   labeledFeaturesLabel = labeledFeaturesLabel.concat(imageBytes.labels.slice(i, i+1).toString());
	       	   labeledFeaturesLabel.push(imageBytes.labels.slice(i, i+1)[0].toString());
		//   console.log('imageBytes.labels.slice(i, i+1)[0] = '+imageBytes.labels.slice(i, i+1)[0]);
		   }
//console.log('labeledFeaturesFeatures.length = '+labeledFeaturesFeatures.length);
//console.log('labeledFeaturesLabel.length = '+labeledFeaturesLabel.length);
//	   var labeledFeatures = [labeledFeaturesFeatures, labeledFeaturesLabel];
	   var labeledFeatures = new Array();
	   for(var i=0; i<labeledFeaturesFeatures.length; i++)
		labeledFeatures.push({features: labeledFeaturesFeatures[i], label: labeledFeaturesLabel[i]});

//console.log('labeledFeatures.length = '+labeledFeatures.length);
return ok({hasErrors: false, val: labeledFeatures}.val);
//return errObj.anyError ? errObj.type : ok({hasErrors: false, val: labeledFeatures}.val);

}