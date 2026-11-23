import { defineUnlistedScript } from 'wxt/utils/define-unlisted-script';
import { copyCurrentLink } from '../lib/run-copy';

export default defineUnlistedScript(() => {
  void copyCurrentLink();
});
