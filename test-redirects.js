import { matchRedirect } from './src/lib/redirect-matcher';

// Test data
const testRedirects = [
    {
        source: "/favicon.ico",
        destination: "https://happymountainnepal.com/favicon.ico",
        permanent: true,
        id: "1",
        createdAt: "2025-12-08T06:16:01.476Z"
    },
    {
        source: "/tours/{{slug}}",
        destination: "/trips/{{slug}}",
        permanent: true,
        id: "2",
        createdAt: "2025-12-15T02:26:40.000Z"
    },
    {
        source: "/name/{{name}}/hello",
        destination: "/greet/{{name}}/world",
        permanent: false,
        id: "3",
        createdAt: "2025-12-15T02:26:40.000Z"
    },
    {
        source: "/blog/{{year}}/{{month}}/{{slug}}",
        destination: "/articles/{{year}}/{{month}}/{{slug}}",
        permanent: true,
        id: "4",
        createdAt: "2025-12-15T02:26:40.000Z"
    }
];

// Test cases
console.log('🧪 Testing Redirect Pattern Matching\n');

// Test 1: Exact match
console.log('Test 1: Exact match');
const result1 = matchRedirect('/favicon.ico', testRedirects);
console.log(`  /favicon.ico -> ${result1?.destination}`);
console.log(`  ✓ Expected: https://happymountainnepal.com/favicon.ico`);
console.log(`  ${result1?.destination === 'https://happymountainnepal.com/favicon.ico' ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 2: Single variable pattern
console.log('Test 2: Single variable pattern');
const result2 = matchRedirect('/tours/langtang-trek', testRedirects);
console.log(`  /tours/langtang-trek -> ${result2?.destination}`);
console.log(`  ✓ Expected: /trips/langtang-trek`);
console.log(`  ${result2?.destination === '/trips/langtang-trek' ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 3: Variable in middle of path
console.log('Test 3: Variable in middle of path');
const result3 = matchRedirect('/name/kishor/hello', testRedirects);
console.log(`  /name/kishor/hello -> ${result3?.destination}`);
console.log(`  ✓ Expected: /greet/kishor/world`);
console.log(`  ${result3?.destination === '/greet/kishor/world' ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 4: Multiple variables
console.log('Test 4: Multiple variables');
const result4 = matchRedirect('/blog/2025/12/my-awesome-post', testRedirects);
console.log(`  /blog/2025/12/my-awesome-post -> ${result4?.destination}`);
console.log(`  ✓ Expected: /articles/2025/12/my-awesome-post`);
console.log(`  ${result4?.destination === '/articles/2025/12/my-awesome-post' ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 5: No match
console.log('Test 5: No match');
const result5 = matchRedirect('/random/path', testRedirects);
console.log(`  /random/path -> ${result5?.destination || 'null'}`);
console.log(`  ✓ Expected: null`);
console.log(`  ${result5 === null ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 6: Special characters in slug
console.log('Test 6: Special characters in slug');
const result6 = matchRedirect('/tours/everest-base-camp-2024', testRedirects);
console.log(`  /tours/everest-base-camp-2024 -> ${result6?.destination}`);
console.log(`  ✓ Expected: /trips/everest-base-camp-2024`);
console.log(`  ${result6?.destination === '/trips/everest-base-camp-2024' ? '✅ PASS' : '❌ FAIL'}\n`);

console.log('✨ All tests completed!');
