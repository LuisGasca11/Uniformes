import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  async function submit() {
    const res = await fetch("http://localhost:4000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.dispatchEvent(new CustomEvent("auth-updated"));
      window.dispatchEvent(new CustomEvent("login-success"));
      return;
    }

    alert(data.error);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="grid gap-5"
    >
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
        Iniciar sesión
      </h1>

      <div className="grid gap-1">
        <label className="text-sm font-medium text-gray-700">Correo electrónico</label>
        <Input
          placeholder="tu@email.com"
          value={form.email}
          className="h-11"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>

      <div className="grid gap-1">
        <label className="text-sm font-medium text-gray-700">Contraseña</label>
        <Input
          placeholder="••••••••"
          type="password"
          className="h-11"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      </div>

      <Button
        type="submit"
        className="h-11 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition"
      >
        Ingresar
      </Button>
    </form>
  );
}
