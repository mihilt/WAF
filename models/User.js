var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// schema
var userSchema = mongoose.Schema({
  username:{
    type:String,
    required:[true,'필수 항목입니다!'],
    match:[/^[a-zA-Z0-9]{3,6}$/,'3~6 자의 영어와 숫자의 조합만 사용이 가능합니다!'],
    trim:true,
    unique:true
  },
  password:{
    type:String,
    required:[true,'필수 항목입니다!'],
    select:false
  },
  name:{
    type:String,
    trim:true
  },
  email:{
    type:String,
    match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,'유효한 이메일 주소를 입력해주세요!'],
    trim:true
  }
},{
  toObject:{virtuals:true}
});

// virtuals
userSchema.virtual('passwordConfirmation')
  .get(function(){ return this._passwordConfirmation; })
  .set(function(value){ this._passwordConfirmation=value; });

userSchema.virtual('originalPassword')
  .get(function(){ return this._originalPassword; })
  .set(function(value){ this._originalPassword=value; });

userSchema.virtual('currentPassword')
  .get(function(){ return this._currentPassword; })
  .set(function(value){ this._currentPassword=value; });

userSchema.virtual('newPassword')
  .get(function(){ return this._newPassword; })
  .set(function(value){ this._newPassword=value; });

// password validation
var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,16}$/;
var passwordRegexErrorMessage = '4~16자의 알파벳과 숫자 조합이 필요합니다!';
userSchema.path('password').validate(function(v) {
  var user = this;

// create user
if(user.isNew){
  if(!user.passwordConfirmation){
    user.invalidate('passwordConfirmation', '필수 항목입니다!');
  }

  if(!passwordRegex.test(user.password)){
    user.invalidate('password', passwordRegexErrorMessage);
  }
  else if(user.password !== user.passwordConfirmation) {
    user.invalidate('passwordConfirmation', '비밀번호 확인이 일치하지 않습니다!');
  }
}

// update user
if(!user.isNew){
   if(!user.currentPassword){
     user.invalidate('currentPassword', '현재 비밀번호가 필요합니다!');
   }
   else if(!bcrypt.compareSync(user.currentPassword, user.originalPassword)){
     user.invalidate('currentPassword', '현재 비밀번호가 필요합니다!');
   }

   if(user.newPassword && !passwordRegex.test(user.newPassword)){
     user.invalidate("newPassword", passwordRegexErrorMessage);
   }
   else if(user.newPassword !== user.passwordConfirmation) {
     user.invalidate('passwordConfirmation', '비밀번호 확인이 일치하지 않습니다!');
   }
 }
});

// hash password
userSchema.pre('save', function (next){
  var user = this;
  if(!user.isModified('password')){
    return next();
  }
  else {
    user.password = bcrypt.hashSync(user.password);
    return next();
  }
});

// model methods
userSchema.methods.authenticate = function (password) {
  var user = this;
  return bcrypt.compareSync(password,user.password);
};

// model & export
var User = mongoose.model('user',userSchema);
module.exports = User;
