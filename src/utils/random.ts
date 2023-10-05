import crypto from 'node:crypto';

/* Just an example of a util function used with path aliases */
export default () => {
  const str = crypto.randomBytes(32).toString('base64');

  return str;
};
