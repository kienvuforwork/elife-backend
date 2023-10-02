import express from 'express';

import auth from './auth';
import user from './user';
import post from './post';
import track from './tvShow';
import tvShow from './track';
const router = express.Router();

export default (): express.Router => {
  auth(router);
  user(router);
  post(router);
  tvShow(router);
  track(router)
  return router;
};