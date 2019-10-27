/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

let dbConnection;

function getDBConnection() {
  if (!dbConnection) {
    dbConnection = MongoClient.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true });
  }
  return dbConnection;
}

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      getDBConnection().then(client => {
        let db = client.db('test');
        db.collection('library').find().toArray()
          .then(result => {
            res.send(result.map(e => {
              let { _id, title, comments } = e;
              return { _id, title, commentcount: comments.length };
            }));
          })
          .catch(err => Promise.reject(err));
      })
    })
    
    .post(function (req, res){
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      getDBConnection().then(client => {
        let db = client.db('test');
        db.collection('library').insertOne({ title, comments: [] })
          .then(result => res.send(result.ops[0]))
          .catch(err => Promise.reject(err));
      });
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      getDBConnection().then(client => {
        let db = client.db('test');
        db.collection('library').deleteMany({})
          .then(() => res.send('complete delete successful'))
          .catch(err => Promise.reject(err));
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      getDBConnection().then(client => {
        let db = client.db('test');
        db.collection('library').find({ _id: ObjectId(bookid) }).toArray()
          .then(result => res.send(result))
          .catch(err => Promise.reject(err));
      });
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      getDBConnection().then(client => {
        let db = client.db('test');
        db.collection('library').findOneAndUpdate(
          { _id: ObjectId(bookid) },
          { $push: { comments: comment } },
          { returnOriginal: false }
        )
          .then(result => res.send(result.value ? result.value : 'no book exists'))
          .catch(err => Promise.reject(err));
      });
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      getDBConnection().then(client => {
        let db = client.db('test');
        db.collection('library').findOneAndDelete({ _id: ObjectId(bookid) })
          .then(result => res.send(result.value ? 'delete successful' : 'no book exists'))
          .catch(err => Promise.reject(err));
      })
    });
  
};
