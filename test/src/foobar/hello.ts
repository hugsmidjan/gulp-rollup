import world from '../js/world';
import { exclaim } from '../data.json';

import '../foobar';

// function resolveAfter2Seconds() {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve('resolved');
//     }, 2000);
//   });
// }
// async function asyncCall() {
//   console.log('calling');
//   var result = await resolveAfter2Seconds();
//   console.log(result);
//   // expected output: 'resolved'
// }
// asyncCall();

alert('Hello ' + world + exclaim);
