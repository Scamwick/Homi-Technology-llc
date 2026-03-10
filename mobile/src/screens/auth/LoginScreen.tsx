import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { colors, spacing, radius, font } from '@/theme'
import { HomiButton } from '@/components/ui'
import { supabase } from '@/lib/supabase'

export function LoginScreen() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  const handleLogin = async () => {
    if (!email || !password) return
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) Alert.alert('Login failed', error.message)
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        {/* Logo wordmark */}
        <View style={styles.logo}>
          <Text style={styles.logoH}>H</Text>
          <Text style={styles.logoO}>ō</Text>
          <Text style={styles.logoM}>M</Text>
          <Text style={styles.logoI}>I</Text>
        </View>
        <Text style={styles.tagline}>The Emotionally Intelligent Decision OS</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.text3}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={colors.text3}
            secureTextEntry
          />
          <HomiButton onPress={handleLogin} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </HomiButton>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg0 },
  inner:     { flex: 1, justifyContent: 'center', padding: spacing.xxl },
  logo:      { flexDirection: 'row', justifyContent: 'center', marginBottom: spacing.md },
  logoH:     { fontSize: 42, fontWeight: '700', color: colors.cyan    },
  logoO:     { fontSize: 42, fontWeight: '700', color: colors.emerald },
  logoM:     { fontSize: 42, fontWeight: '700', color: colors.yellow  },
  logoI:     { fontSize: 42, fontWeight: '700', color: colors.cyan    },
  tagline:   { textAlign: 'center', color: colors.text3, fontSize: font.sizes.sm, marginBottom: spacing.xxxl },
  form:      { gap: spacing.md },
  input: {
    backgroundColor: colors.bg1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.text1,
    fontSize: font.sizes.base,
  },
})
