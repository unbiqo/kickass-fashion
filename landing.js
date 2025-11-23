// landing.js

// YOUR GOOGLE SCRIPT URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwt1NjuEvzPRIGtAMHLmS6cWC8YbG0vpFdt9ZfpeTchQFzJ-0vDd3LI77anfOVrdlFOow/exec';

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. INTELLIGENT TRACKING (Sessions) ---
    const urlParams = new URLSearchParams(window.location.search);
    
    // Helper: Get param from URL OR Session Storage OR Default
    function getTrackable(key, defaultVal) {
        // A. Check URL first (Highest priority)
        let val = urlParams.get(key);
        if (val) {
            // Save to storage for later (survives redirects)
            sessionStorage.setItem(key, val);
            return val;
        }
        // B. Check Storage (If URL was stripped)
        val = sessionStorage.getItem(key);
        if (val) return val;
        
        // C. Fallback
        return defaultVal;
    }

    // Fill the hidden buckets with "Sticky" data
    const source = getTrackable('utm_source', 'direct');
    const medium = getTrackable('utm_medium', 'n/a');
    const campaign = getTrackable('utm_campaign', 'n/a');

    // Safely fill inputs if they exist in HTML
    if(document.getElementById('utm_source')) {
        document.getElementById('utm_source').value = source;
        document.getElementById('utm_medium').value = medium;
        document.getElementById('utm_campaign').value = campaign;
    }

    console.log("Tracking Locked In:", { source, medium, campaign });

    // --- 2. HANDLE SUBMISSION ---
    const form = document.getElementById('waitlist-form');
    const successMsg = document.getElementById('success-message');
    const emailInput = document.getElementById('email');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = form.querySelector('button');
            
            // Loading State
            btn.innerText = 'Joining...';
            btn.style.opacity = '0.7';
            btn.disabled = true;

            // Create Data Package
            const formData = new FormData(form);
            
            // Add Browser Info
            formData.append('UserAgent', navigator.userAgent); 
            formData.append('Language', navigator.language);   
            formData.append('Referrer', document.referrer);    

            // Add Location (Async)
            try {
                const ipReq = await fetch('https://ipapi.co/json/');
                const ipData = await ipReq.json();
                formData.append('IP', ipData.ip);
                formData.append('City', `${ipData.city}, ${ipData.country_name}`);
            } catch (err) {
                console.log('IP fetch skipped');
            }

            // Send to Google Sheets
            fetch(SCRIPT_URL, {
                method: 'POST',
                body: formData,
                mode: 'no-cors'
            })
            .then(() => {
                form.style.display = 'none';
                successMsg.style.display = 'block';
                successMsg.animate([
                    { opacity: 0, transform: 'translateY(10px)' },
                    { opacity: 1, transform: 'translateY(0)' }
                ], { duration: 400, fill: 'forwards' });
                
                console.log("Lead Sent:", emailInput.value);
            })
            .catch(error => {
                console.error('Error:', error);
                btn.innerText = 'Error. Try again.';
                btn.disabled = false;
                btn.style.opacity = '1';
            });
        });
    }
});