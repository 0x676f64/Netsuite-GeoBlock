/**
 * NetSuite Website Geographic Access Control
 * Prevents non-US users from registering accounts and making purchases
 * Helps prevent credit card fraud and spam transactions
 */

// =============================================================================
// SUITELET FOR WEBSITE ACCESS CONTROL
// =============================================================================

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/https', 'N/redirect', 'N/ui/serverWidget', 'N/runtime'], 
function(log, https, redirect, serverWidget, runtime) {
    
    /**
     * Main function to handle website requests and geographic validation
     */
    function onRequest(context) {
        try {
            var request = context.request;
            var response = context.response;
            
            // Get user's IP address from request
            var userIP = getUserIPFromRequest(request);
            
            if (!userIP) {
                log.error('IP Detection Failed', 'Could not determine user IP');
                showAccessDeniedPage(response, 'Unable to verify your location');
                return;
            }
            
            log.debug('Location Check', 'Checking IP: ' + userIP);
            
            // Check if user is accessing from US
            var locationData = getLocationFromIP(userIP);
            
            if (!locationData || locationData.countryCode !== 'US') {
                var country = locationData ? locationData.country : 'Unknown';
                log.audit('Access Denied', 'Non-US access attempt from: ' + country + ' (IP: ' + userIP + ')');
                showAccessDeniedPage(response, 'This website is only available to customers in the United States');
                return;
            }
            
            log.debug('Access Granted', 'US user verified (IP: ' + userIP + ')');
            
            // Allow access - redirect to intended page or continue normal flow
            if (request.parameters.redirect_url) {
                redirect.redirect({
                    url: decodeURIComponent(request.parameters.redirect_url)
                });
            } else {
                // Continue to homepage or registration
                response.write('Location verified. Access granted.');
            }
            
        } catch (e) {
            log.error('Geographic Access Control Error', e.toString());
            showAccessDeniedPage(context.response, 'Access verification failed');
        }
    }
    
    /**
     * Extract user IP from request headers
     */
    function getUserIPFromRequest(request) {
        // Try multiple headers that might contain the real IP
        var ipHeaders = [
            'HTTP_CF_CONNECTING_IP',     // Cloudflare
            'HTTP_X_FORWARDED_FOR',      // Standard proxy header
            'HTTP_X_REAL_IP',            // Nginx proxy
            'HTTP_X_FORWARDED',          // Alternative
            'HTTP_X_CLUSTER_CLIENT_IP',  // Cluster
            'HTTP_CLIENT_IP',            // Client IP
            'REMOTE_ADDR'                // Direct connection
        ];
        
        for (var i = 0; i < ipHeaders.length; i++) {
            var ip = request.headers[ipHeaders[i]];
            if (ip && ip !== 'unknown') {
                // Handle comma-separated IPs (take first one)
                if (ip.indexOf(',') > -1) {
                    ip = ip.split(',')[0].trim();
                }
                if (isValidIP(ip)) {
                    return ip;
                }
            }
        }
        
        return null;
    }
    
    /**
     * Validate IP address format
     */
    function isValidIP(ip) {
        var ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipRegex.test(ip) && ip !== '127.0.0.1' && ip !== '0.0.0.0';
    }
    
    /**
     * Get location data from IP using geolocation service
     */
    function getLocationFromIP(ipAddress) {
        try {
            // Using ip-api.com (free tier: 1000 requests/month)
            var response = https.get({
                url: 'http://ip-api.com/json/' + ipAddress + '?fields=status,country,countryCode,region,city,isp,query'
            });
            
            if (response.code === 200) {
                var data = JSON.parse(response.body);
                
                if (data.status === 'success') {
                    log.debug('Geolocation Success', JSON.stringify(data));
                    return data;
                }
            }
            
            // Fallback to alternative service
            return getLocationFromIPFallback(ipAddress);
            
        } catch (e) {
            log.error('Primary Geolocation Failed', e.toString());
            return getLocationFromIPFallback(ipAddress);
        }
    }
    
    /**
     * Fallback geolocation service
     */
    function getLocationFromIPFallback(ipAddress) {
        try {
            // Using ipapi.co as fallback (30,000 requests/month free)
            var response = https.get({
                url: 'https://ipapi.co/' + ipAddress + '/json/'
            });
            
            if (response.code === 200) {
                var data = JSON.parse(response.body);
                return {
                    status: 'success',
                    country: data.country_name,
                    countryCode: data.country_code,
                    region: data.region,
                    city: data.city,
                    isp: data.org,
                    query: ipAddress
                };
            }
        } catch (e) {
            log.error('Fallback Geolocation Failed', e.toString());
        }
        
        return null;
    }
    
    /**
     * Show access denied page
     */
    function showAccessDeniedPage(response, message) {
        var html = '<!DOCTYPE html>' +
            '<html><head>' +
            '<title>Access Restricted</title>' +
            '<style>' +
            'body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; background-color: #f5f5f5; }' +
            '.container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }' +
            '.error-icon { font-size: 60px; color: #e74c3c; margin-bottom: 20px; }' +
            'h1 { color: #2c3e50; margin-bottom: 20px; }' +
            'p { color: #7f8c8d; line-height: 1.6; margin-bottom: 20px; }' +
            '.contact-info { background: #ecf0f1; padding: 20px; border-radius: 5px; margin-top: 20px; }' +
            '</style>' +
            '</head><body>' +
            '<div class="container">' +
            '<div class="error-icon">🚫</div>' +
            '<h1>Access Restricted</h1>' +
            '<p>' + message + '</p>' +
            '<p>We apologize for any inconvenience. This restriction helps us prevent fraudulent transactions and maintain the security of our payment systems.</p>' +
            '<div class="contact-info">' +
            '<strong>Need assistance?</strong><br>' +
            'If you are located in the United States and believe this is an error, please contact our customer service team.' +
            '</div>' +
            '</div>' +
            '</body></html>';
        
        response.write(html);
    }
    
    return {
        onRequest: onRequest
    };
});
