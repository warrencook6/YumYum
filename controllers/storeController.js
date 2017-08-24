const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');  
const jimp = require('jimp');  // Used for resizing the images to what they are supposed to be!
const uuid = require('uuid'); // Used so that if two files are uploaded with the same name, it will handle it rather than me writing the logic for it


const multerOptions= {
  // read photo into storate
  storage: multer.memoryStorage(),
  // Check that is an allowed file (not some bullshit file)
  fileFilter: function(req, file, next){
    const isPhoto= file.mimetype.startsWith('image/');
    if(isPhoto) {
      next(null, true);
    }else{
      next({message: 'That file type is not accepted!'}, false)
    }
  }
}

exports.homePage = function(req, res){
    res.render('index');
}

exports.addStore = function(req, res){
    res.render('editStore', {title: 'Add Store!'});  // Calling it edit store because we will use the same template for editing and adding a store
}
// reads it into memory
exports.upload = multer(multerOptions).single('photo');


exports.resize = async function (req, res, next) {
    //check if there is no new file to resize
    if(!req.file) {
      next(); //skip to next MW
      return;
    }

    // finds the file and splits the last part to get the file type (jpeg, etc)
    const extension = req.file.mimetype.split('/')[1];
    // gets the actuall photo and uses uuid to get unique identifier and then puts the extension back onto it
    req.body.photo = `${uuid.v4()}.${extension}`

    // now that we have the right file with the right name, we resize it. Use await to make sure that the file has buffered and shit before we save it as a variable
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);

    // Once we have writen the photo to our file system =>
    next();
}





/**
 * Will be using async await most of the time when tyring to return something from the database, that way we know we have the data before moving on
 */

exports.createStore = async function(req, res) {
  const store = await (new Store(req.body)).save();  //saves the store
  req.flash('success', `Successfully created ${store.name}, care to leave a review?`);  //Then flashes this with store name
  res.redirect(`/store/${store.slug}`);  //annnd redirects to the store page
};

exports.getStores = async function(req, res){
    // query DB
    const stores = await Store.find();
    res.render('stores', {title: 'Stores', stores: stores});
}

exports.editStore = async function (req, res) {
  // Set the location to be a point, this is so when you update a page, the shit doesnt fuck itself
  // req.body.location.type = 'Point';
  // 1. Find the store given the ID
  const store = await Store.findOne({ _id: req.params.id });
  // 2. confirm they are the owner of the store
  // TODO
  // 3. Render out the edit form so the user can update their store
  res.render('editStore', { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {

  // find and update the store
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // return the new store instead of the old one
    runValidators: true
  }).exec();
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store →</a>`);
  res.redirect(`/stores/${store._id}/edit`);
  // Redriect them the store and tell them it worked
};

exports.getStoreBySlug = async function (req, res, next) {
  // querry DB
  const store = await Store.findOne({slug: req.params.slug});
  if(!store) return next();
  res.render('store', {store, title: store.name})
}

exports.getStoresByTag = async function(req,res){
  const tag = req.params.tag;
  const tagQuery = tag || {$exists: true}; // If no tag is selected, show any store that has any tag
  const tagsPromise =  Store.getTagsList(); //Used to get us an array of tags (id of store and the count)
  const storesPromise = Store.find({ tags: tagQuery}); // Used to get us all the stores that have that tag
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]); // Returns us the array
  res.render('tag', {title: 'tags', tags, tag, stores})
}