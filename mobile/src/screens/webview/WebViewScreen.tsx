import React from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'
import { useRoute } from '@react-navigation/native'
import { colors } from '@/theme'

const BASE_URL = 'https://xn--hmi-qxa.com'

export function WebViewScreen() {
  const route = useRoute<any>()
  const url   = `${BASE_URL}${route.params?.url ?? '/'}`

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <WebView
        source={{ uri: url }}
        style={styles.webview}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.cyan} size="large" />
          </View>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.bg0 },
  webview: { flex: 1, backgroundColor: colors.bg0 },
  loading: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg0 },
})
