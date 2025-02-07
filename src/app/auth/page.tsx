"use client";

import { Card, TextInput, Button, Label, Alert } from "flowbite-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const DEFAULT_CREDENTIALS = {
  username: "admin",
  password: "admin123",
};

export default function LoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      credentials.username === DEFAULT_CREDENTIALS.username &&
      credentials.password === DEFAULT_CREDENTIALS.password
    ) {
      router.push("/dashboard");
    } else {
      setError("Identifiants incorrects");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[350px]">
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            Connexion
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Connectez-vous pour accéder à l'application
          </p>

          {error && (
            <Alert color="failure" onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}

          <div>
            <div className="mb-2 block">
              <Label htmlFor="username" value="Nom d'utilisateur" />
            </div>
            <TextInput
              id="username"
              type="text"
              value={credentials.username}
              onChange={(e) =>
                setCredentials({ ...credentials, username: e.target.value })
              }
              required
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="password" value="Mot de passe" />
            </div>
            <TextInput
              id="password"
              type="password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Se connecter
          </Button>

          <div className="text-sm text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="font-medium mb-1">Identifiants de démonstration :</p>
            <p>Nom d'utilisateur : <span className="font-mono">admin</span></p>
            <p>Mot de passe : <span className="font-mono">admin123</span></p>
          </div>
        </form>
      </Card>
    </div>
  );
} 