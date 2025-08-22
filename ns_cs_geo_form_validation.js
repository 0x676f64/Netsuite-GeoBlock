// =============================================================================
// CLIENT SCRIPT FOR REGISTRATION/CHECKOUT PAGES
// =============================================================================

/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

define(['N/ui/message', 'N/https'], function(message, https) {
    
    function pageInit(context) {
        // Run location check when registration or checkout page loads
        checkUserLocationClient();
    }
    
    function checkUserLocationClient() {
        try {
            // Get user's public IP using a JSONP service
            var script = document.createElement('script');
            script.src = 'https://api.ipify.org?format=jsonp&callback=handleIPResponse';
            document.head.appendChild(script);
            
        } catch (e) {
            console.error('Client location check failed:', e);
        }
    }
    
    // Global callback function for JSONP
    window.handleIPResponse = function(data) {
        var userIP = data.ip;
        validateLocationByIP(userIP);
    };
    
    function validateLocationByIP(ipAddress) {
        // Use a client-accessible geolocation service
        fetch('https://ipapi.co/' + ipAddress + '/json/')
            .then(response => response.json())
            .then(data => {
                if (data.country_code !== 'US') {
                    showLocationError(data.country_name || 'Unknown');
                    disableFormSubmission();
                }
            })
            .catch(error => {
                console.error('Location validation failed:', error);
            });
    }
    
    function showLocationError(country) {
        var errorMsg = message.create({
            title: 'Registration Not Available',
            message: 'Account registration is currently only available to customers in the United States. ' +
                    'Detected location: ' + country,
            type: message.Type.ERROR
        });
        errorMsg.show();
    }
    
    function disableFormSubmission() {
        // Disable all submit buttons and forms
        var forms = document.querySelectorAll('form');
        var submitButtons = document.querySelectorAll('input[type="submit"], button[type="submit"]');
        
        forms.forEach(function(form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Registration is not available from your current location.');
            });
        });
        
        submitButtons.forEach(function(button) {
            button.disabled = true;
            button.style.opacity = '0.5';
        });
    }
    
    return {
        pageInit: pageInit
    };
});