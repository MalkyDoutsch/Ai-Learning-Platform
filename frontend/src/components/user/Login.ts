const API_URL = "http://localhost:8000/users"; // כתובת ה-backend שלך

export async function SignupUser(name: string, phone: string, password: string) { 
  const response = await fetch(`${API_URL}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, phone, password })
  });
  if (!response.ok) throw new Error("Registration failed");
  return response.json();
}

export async function loginUser(phone: string, password: string) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password })
  });
  if (!response.ok) throw new Error("Login failed");
  return response.json();
}
