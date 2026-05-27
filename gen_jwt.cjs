const { encode } = require('@auth/core/jwt');
const secret = '/XbdkCfd8UvLHCdJEXswHnhjX0oPuwfvCULh0Th4XZ9zODg2bAtB/RyUdIG+KIYw';
(async () => {
  const t = await encode({secret, token: {email:'test-live@cp.com',sub:'test-live'}, salt: 'authjs.session-token'});
  console.log(t);
})();
