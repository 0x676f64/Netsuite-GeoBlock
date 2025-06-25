// =============================================================================
// USER EVENT SCRIPT FOR CUSTOMER RECORDS
// =============================================================================

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

define(['N/log', 'N/record', 'N/search'], function(log, record, search) {
    
    function beforeSubmit(context) {
        try {
            if (context.type !== context.UserEventType.CREATE) {
                return; // Only check new customer creation
            }
            
            var customerRecord = context.newRecord;
            var email = customerRecord.getValue('email');
            var country = customerRecord.getValue('country') || 
                         customerRecord.getValue('billcountry') || 
                         customerRecord.getValue('shipcountry');
            
            // Block if country is not US
            if (country && country !== 'US') {
                log.audit('Customer Creation Blocked', 'Non-US customer attempt: ' + email + ' from ' + country);
                throw new Error('Customer registration is only available for United States residents.');
            }
            
            // Additional validation for suspicious patterns
            if (email && isSuspiciousEmail(email)) {
                log.audit('Suspicious Email Blocked', 'Blocked suspicious email: ' + email);
                throw new Error('Unable to process registration. Please contact customer service.');
            }
            
        } catch (e) {
            log.error('Customer Validation Error', e.toString());
            throw e;
        }
    }
    
    function isSuspiciousEmail(email) {
        // Common patterns used by spammers
        var suspiciousPatterns = [
            /^[a-z]{1,3}[0-9]{3,}@/,           // Short letters + many numbers
            /temp|test|fake|spam|abuse/i,       // Suspicious keywords
            /^[0-9]+@/,                        // Starting with numbers only
            /@(tempmail|guerrillamail|10minutemail|mailinator)/i // Temp email services
        ];
        
        return suspiciousPatterns.some(pattern => pattern.test(email));
    }
    
    return {
        beforeSubmit: beforeSubmit
    };
});
