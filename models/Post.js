var mongoose = require('mongoose');

// schema
var postSchema = mongoose.Schema({
  title:{type:String, required:[true,'제목을 입력해주세요!']},
  body:{type:String, required:[true,'내용을 입력해주세요!']},
  author:{type:mongoose.Schema.Types.ObjectId, ref:'user', required:true},
  createdAt:{type:Date, default:Date.now},
  updatedAt:{type:Date},
});

// model & export
var Post = mongoose.model('post', postSchema);
module.exports = Post;
