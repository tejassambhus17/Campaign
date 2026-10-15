import { useState } from "react";
import { View } from "react-native";
import { Button, Field, Notice, Pill, Text, styles } from "../components/ui";
import { useSession } from "../lib/session";
export function AuthForm() {
  const session = useSession();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit() {
    setBusy(true);
    setError("");
    try {
      if (mode === "register") await session.register(name, email, password);
      else await session.login(email, password);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <View style={{ gap: 18 }}>
      <Text style={styles.body}>
        One account to create campaigns, back messages and follow their
        progress. You can browse without signing in.
      </Text>
      <View style={styles.row}>
        <Pill
          title="Create account"
          selected={mode === "register"}
          onPress={() => {
            setMode("register");
            setError("");
          }}
        />
        <Pill
          title="Sign in"
          selected={mode === "login"}
          onPress={() => {
            setMode("login");
            setError("");
          }}
        />
      </View>
      {mode === "register" && (
        <Field
          label="Your name"
          value={name}
          autoComplete="name"
          onChangeText={setName}
          editable={!busy}
          maxLength={150}
        />
      )}
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoComplete="email"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!busy}
      />
      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!busy}
        autoComplete={mode === "register" ? "new-password" : "current-password"}
        hint={
          mode === "register"
            ? "At least 8 characters. Use a password unique to this account."
            : undefined
        }
      />
      {!!error && <Notice tone="error">{error}</Notice>}
      <Button
        title={mode === "register" ? "Create account" : "Sign in"}
        loading={busy}
        disabled={
          !email || password.length < 8 || (mode === "register" && !name.trim())
        }
        onPress={submit}
      />
      <Text style={styles.muted}>
        Demonstration account. Payments and advertising are simulated. Public
        backer names stay private by default.
      </Text>
    </View>
  );
}
