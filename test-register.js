async function run() {
  try {
    const res = await fetch("http://localhost:8080/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Test",
        lastName: "User",
        email: "soodpranav235+test4@gmail.com",
        password: "Password123!"
      })
    });
    console.log("Status:", res.status);
    console.log(await res.json());
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

run();
