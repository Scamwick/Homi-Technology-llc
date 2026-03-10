import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { colors, spacing, radius, font } from '@/theme'
import { HomiText, HomiCard, HomiBadge, HomiButton } from '@/components/ui'
import { supabase } from '@/lib/supabase'

const MENU_ITEMS = [
  { label: 'Billing',     url: '/settings/billing'  },
  { label: 'Platform',    url: '/platform'           },
  { label: 'Marketplace', url: '/marketplace'        },
  { label: 'Intelligence',url: '/intelligence'       },
  { label: 'Help',        url: '/help'               },
]

export function SettingsScreen() {
  const [email, setEmail]   = useState('')
  const [tier, setTier]     = useState('free')
  const navigation           = useNavigation<any>()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setEmail(user.email ?? '')
      supabase.from('profiles').select('subscription_tier').eq('id', user.id).single()
        .then(({ data }) => { if (data) setTier(data.subscription_tier ?? 'free') })
    })
  }, [])

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ])
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <HomiText variant="h3" style={{ marginBottom: spacing.xl }}>Settings</HomiText>

        {/* Profile card */}
        <HomiCard style={{ marginBottom: spacing.xl }}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{email.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <HomiText variant="body" bold style={{ color: colors.text1 }}>{email}</HomiText>
              <HomiBadge variant="cyan">{tier}</HomiBadge>
            </View>
          </View>
        </HomiCard>

        {/* Menu */}
        <HomiText variant="xs" style={styles.sectionLabel}>TOOLS</HomiText>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            onPress={() => navigation.navigate('WebView', { url: item.url, title: item.label })}
          >
            <HomiText variant="body" style={{ color: colors.text1 }}>{item.label}</HomiText>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}

        <HomiButton
          variant="outline"
          onPress={handleSignOut}
          style={{ marginTop: spacing.xxl, borderColor: colors.crimson + '60' }}
        >
          Sign Out
        </HomiButton>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: colors.bg0 },
  scroll:     { flex: 1 },
  content:    { padding: spacing.xl, paddingBottom: spacing.xxxl },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar:     { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.bg2, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.text1, fontSize: font.sizes.md, fontWeight: font.weights.bold },
  sectionLabel:{ fontSize: font.sizes.xs, color: colors.text3, letterSpacing: 1, marginBottom: spacing.sm, fontFamily: 'monospace' },
  menuItem:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  arrow:      { color: colors.text3, fontSize: 20 },
})
