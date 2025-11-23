document.getElementById('waitlist-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const btn = this.querySelector('button');
    
    // Loading state
    btn.innerHTML = "Processing...";
    btn.style.opacity = "0.7";
    
    setTimeout(() => {
        this.style.display = 'none';
        document.getElementById('success-msg').style.display = 'block';
        console.log("Captured:", email); 
        // In real life, send 'email' to your database/API here
    }, 1000);
});