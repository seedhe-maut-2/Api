addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomEmail(name) {
  const domains = ["example.com", "mail.com", "test.org", "demo.net"];
  const num = randomInt(10, 99);
  return `${name.toLowerCase().replace(/\s/g, ".")}${num}@${randomElement(domains)}`;
}

function generatePhoneUSA() {
  // Format: +1-XXX-XXX-XXXX (random digits)
  const areaCode = randomInt(200, 999);
  const exchange = randomInt(200, 999);
  const lineNumber = randomInt(1000, 9999);
  return `+1-${areaCode}-${exchange}-${lineNumber}`;
}

function generatePhoneIndia() {
  // Format: +91-9XXXXXXXXX (10 digits starting with 9)
  let number = "+91-9";
  for (let i = 0; i < 9; i++) {
    number += randomInt(0, 9).toString();
  }
  return number;
}

function generateUSA() {
  const maleNames = ["Jake Williamson", "John Smith", "Michael Johnson", "David Brown", "Chris Davis"];
  const femaleNames = ["Emily Clark", "Jessica Miller", "Sarah Wilson", "Ashley Moore", "Megan Taylor"];
  const streets = ["Elm Street", "Maple Avenue", "Oak Drive", "Pine Lane", "Cedar Road"];
  const cities = ["Springfield", "Franklin", "Greenville", "Bristol", "Clinton"];
  const states = ["IL", "CA", "NY", "TX", "FL"];

  const gender = randomElement(["Male", "Female"]);
  const name = gender === "Male" ? randomElement(maleNames) : randomElement(femaleNames);
  const streetNum = randomInt(100, 9999);
  const city = randomElement(cities);
  const state = randomElement(states);
  const zip = String(randomInt(10000, 99999));

  return {
    name,
    gender,
    age: randomInt(18, 60),
    email: randomEmail(name),
    phone: generatePhoneUSA(),
    address: `${streetNum} ${randomElement(streets)}, ${city}, ${state} ${zip}`,
    zip,
    country: "USA"
  };
}

function generateIndia() {
  const maleNames = ["Ravi Kumar", "Amit Sharma", "Sunil Gupta", "Sanjay Singh", "Rajesh Patel"];
  const femaleNames = ["Neha Sharma", "Anita Gupta", "Priya Singh", "Pooja Patel", "Sneha Reddy"];
  const localities = ["Nehru Nagar", "MG Road", "Station Road", "Civil Lines", "Sector 15"];
  const cities = ["New Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad"];
  const states = ["Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Telangana"];
  const pin = String(randomInt(110001, 999999));

  const gender = randomElement(["Male", "Female"]);
  const name = gender === "Male" ? randomElement(maleNames) : randomElement(femaleNames);
  const houseNum = randomInt(1, 200);
  const locality = randomElement(localities);
  const city = randomElement(cities);
  const state = randomElement(states);

  return {
    name,
    gender,
    age: randomInt(18, 60),
    email: randomEmail(name),
    phone: generatePhoneIndia(),
    address: `${houseNum}/${randomInt(1, 50)} ${locality}, ${city}, ${state} ${pin}`,
    zip: pin,
    country: "India"
  };
}

async function handleRequest(request) {
  try {
    const url = new URL(request.url);
    const input = url.searchParams.get("input");

    if (!input) {
      return jsonResponse({ result: "No input provided" });
    }

    const val = input.trim().toLowerCase();

    let resultData;

    if (val === "usa" || val === "us" || val === "america") {
      resultData = generateUSA();
    } else if (val === "india" || val === "in") {
      resultData = generateIndia();
    } else {
      resultData = { error: "Unsupported country or input" };
    }

    return jsonResponse({ result: resultData });
  } catch (err) {
    return jsonResponse({ result: "Internal Server Error" }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "Cache-Control": "no-store"
    }
  });
}
