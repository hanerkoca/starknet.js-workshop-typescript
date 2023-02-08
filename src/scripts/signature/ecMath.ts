//
// 
// code valid only for small numbers, so not for Starknet
//
//

// https://stackoverflow.com/questions/5989429/pow-and-mod-function-optimization
export function modularExp(base: bigint, exp: bigint, mod: bigint): bigint {
    if (exp == 0n) return 1n;
    if (exp % 2n == 0n) {
        return modularExp(base, (exp / 2n), mod) ** 2n % mod;
    }
    else {
        return (base * modularExp(base, (exp - 1n), mod)) % mod;
    }
}



// JavaScript program to implement Shanks
// Tonelli algorithm for finding
// Modular Square Roots
// https://www.geeksforgeeks.org/find-square-root-modulo-p-set-2-shanks-tonelli-algorithm/

let z = 0n;

// utility function to find
// pow(base, exponent) % modulus
function pow1(base1: bigint,
    exponent: bigint, modulus: bigint): bigint {
    let result = 1n;
    base1 = base1 % modulus;
    while (exponent > 0n) {
        if (exponent % 2n == 1n)
            result = (result * base1) % modulus;
        exponent = exponent >> 1n;
        base1 = (base1 * base1) % modulus;
    }
    return result;
}

// utility function to find gcd
function gcd(a: bigint, b: bigint): bigint {
    if (b == 0n)
        return a;
    else
        return gcd(b, a % b);
}

// Returns k such that b^k = 1 (mod p)
function order(p: bigint, b: bigint): bigint {
    if (gcd(p, b) != 1n) {
        console.error("p and b are not co-prime.");
        return -1n;
    }

    // Initializing k with first
    // odd prime number
    let k = 3n;
    while (true) {
        if (pow1(b, k, p) == 1n)
            return k;
        k++;
    }
}

// function return p - 1 (= x argument)
// as x * 2^e, where x will be odd
// sending e as reference because
// updation is needed in actual e
function convertx2e(x: bigint): bigint {
    z = 0n;
    while (x % 2n == 0n) {
        x /= 2n;
        z++;
    }
    return x;
}

// Main function for finding
// the modular square root
export function modularSquareRoot(n: bigint, p: bigint): bigint {
    // a and p should be coprime for
    // finding the modular square root
    if (gcd(n, p) != 1n) {
        console.error("a and p are not coprime");
        return -1n;
    }

    // If below expression return (p - 1) then modular
    // square root is not possible
    if (pow1(n, (p - 1n) / 2n, p) == (p - 1n)) {
        console.error("no sqrt possible" + "<br/>");
        return -1n;
    }

    // expressing p - 1, in terms of
    // s * 2^e, where s is odd number
    let s: bigint, e: bigint;
    s = convertx2e(p - 1n);
    e = z;

    // finding smallest q such that q ^ ((p - 1) / 2)
    // (mod p) = p - 1
    let q: bigint;
    for (q = 2n; ; q++) {
        // q - 1 is in place of (-1 % p)
        if (pow1(q, (p - 1n) / 2n, p) == (p - 1n))
            break;
    }

    // Initializing variable x, b and g
    let x: bigint = pow1(n, (s + 1n) / 2n, p);
    let b: bigint = pow1(n, s, p);
    let g: bigint = pow1(q, s, p);

    let r = e;

    // keep looping until b
    // become 1 or m becomes 0
    while (true) {
        let m: bigint;
        for (m = 0n; m < r; m++) {
            if (order(p, b) == -1n)
                return -1n;

            // finding m such that b^ (2^m) = 1
            if (order(p, b) == 2n ** m)
                break;
        }
        if (m == 0n)
            return x;

        // updating value of x, g and b
        // according to algorithm
        x = (x * pow1(g, 2n ** (r - m - 1n), p)) % p;
        g = pow1(g, 2n ** (r - m), p);
        b = (b * g) % p;

        if (b == 1n)
            return x;
        r = m;
    }
}

// Driver Code

let n = 2n;

// p should be prime
let p = 113n;

let x = modularSquareRoot(n, p);

if (x == -1n)
    console.log("Modular square root is not exist");
else
    console.log("Modular square root of " +
        n + " and " + p + " is " +
        x + "\n");



