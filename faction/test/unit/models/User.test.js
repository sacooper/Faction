describe.only('UserModel', function() {

  describe('#create()', function() {

    it('should prevent duplicate creations', function(done) {

      User.create(fixtures['users'][0])
        .then(function(user1) {
          User.create(fixtures['users'][0])
          .then(function(user2) {
            console.log('user1', user1);
            console.log('user2', user2);
            done();
          })
          .catch(function(err){
            console.log(err);
            done()
          });
        })
        .catch(function(err){
          console.log(err);
          done();
        })
    });

    // it('should check find function', function (done) {
    //   User.find()
    //     .then(function(results) {
    //       // some tests
    //       console.log(results);
    //       done();
    //     })
    //     .catch(done);
    // });

  });

});