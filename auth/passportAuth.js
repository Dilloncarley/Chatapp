module.exports = function(passport, FacebookStrategy, config, mongoose){

	var chatUser = new mongoose.Schema({
		profileID:String,
		fullName:String,
		profilePic:String
	})

	

	var userModel = mongoose.model('chatUser', chatUser);

	//stores in session across pages
	passport.serializeUser(function(user, done){
		done(null, user.id);
	});
//lets us use e.id as reference and use rest of data
	passport.deserializeUser(function(id, done){
		userModel.findById(id, function(err, user){
			done(err, user);
		})
	})

	passport.use(new FacebookStrategy({
		clientID: config.fb.appID, 
		clientSecret: config.fb.appSecret,
		callbackURL: config.fb.callbackURL,
		profileFields:['id', 'displayName', 'photos']
	}, function(accessToken, refreshToken, profile, done){
		//Check if user exists in our MongoDB db 
		//if not, create one and return profile
		// if user exists , simply return profile

		userModel.findOne({'profileID': profile.id}, function(err, result){
			if (result){
				done(null, result);
			}else {
				//Create a new user in our Mongolab account
				var newChatUser = new userModel({
					profileID:profile.id,
					fullName:profile.displayName,
					profilePic:profile.photos[0].value || ''
				});

				newChatUser.save(function(err){
					done(null, newChatUser);
				})
			}
		})
	}))
}