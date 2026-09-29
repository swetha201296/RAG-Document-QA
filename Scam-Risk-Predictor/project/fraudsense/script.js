function analyzeMessage(){

    let msg = document.getElementById("message").value.toLowerCase();
    let score = 0;
    let details = "";

    let amountMatch = msg.match(/rs\.?\s?\d+[,\d]*/);
    if(amountMatch){
        details += "💵 Amount Detected: " + amountMatch[0] + "<br>";
        let amountValue = parseInt(amountMatch[0].replace(/\D/g,''));
        if(amountValue > 50000){
            score += 30;
            details += "⚠ High Unusual Amount<br>";
        }
    }

    let suspiciousDomains = [".xyz",".info",".cc",".tk",".ml"];
    suspiciousDomains.forEach(domain=>{
        if(msg.includes(domain)){
            score += 25;
            details += "🌐 Suspicious Domain Detected ("+domain+")<br>";
        }
    });

    let urgencyWords = ["urgent","immediately","final warning","last chance","blocked","suspended"];
    urgencyWords.forEach(word=>{
        if(msg.includes(word)){
            score += 10;
            details += "⏰ Urgency Language Detected<br>";
        }
    });

    let paymentWords = ["pay","processing fee","registration fee","claim now","click here","otp"];
    paymentWords.forEach(word=>{
        if(msg.includes(word)){
            score += 15;
            details += "💳 Payment / Action Request Detected<br>";
        }
    });

    if(score > 95) score = 95;

    let result = document.getElementById("result");
    let meter = document.getElementById("meterFill");

    if(score >= 70){
        result.innerHTML = "🔴 HIGH SCAM RISK<br>Fraud Probability: "+score+"%";
        meter.style.background = "linear-gradient(to right,red,orange)";
    }
    else if(score >= 40){
        result.innerHTML = "🟡 MEDIUM RISK<br>Fraud Probability: "+score+"%";
        meter.style.background = "linear-gradient(to right,orange,yellow)";
    }
    else{
        result.innerHTML = "🟢 LOW RISK<br>Fraud Probability: "+score+"%";
        meter.style.background = "linear-gradient(to right,green,cyan)";
    }

    meter.style.width = score + "%";
    document.getElementById("analysisDetails").innerHTML = details;
}