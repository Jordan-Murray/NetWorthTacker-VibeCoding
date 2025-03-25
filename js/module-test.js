/**
 * Module Test
 * Tests if ES6 modules are loading correctly
 */

console.log('MODULE-TEST.JS STARTING');

// Import the minimal test module
import { sayHello } from './modules/minimal-test.js';

// Try to use the imported function
console.log('About to call sayHello()');
const result = sayHello();
console.log('Result from sayHello():', result);

console.log('MODULE-TEST.JS COMPLETED'); 