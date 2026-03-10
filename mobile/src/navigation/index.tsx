import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { View, Text } from 'react-native'
import { supabase } from '@/lib/supabase'
import { colors, font } from '@/theme'

import { LoginScreen }      from '@/screens/auth/LoginScreen'
import { DashboardScreen }  from '@/screens/dashboard/DashboardScreen'
import { AssessmentScreen } from '@/screens/assessment/AssessmentScreen'
import { PanelsScreen }     from '@/screens/panels/PanelsScreen'
import { CompanionScreen }  from '@/screens/companion/CompanionScreen'
import { SettingsScreen }   from '@/screens/settings/SettingsScreen'
import { WebViewScreen }    from '@/screens/webview/WebViewScreen'

const Stack = createNativeStackNavigator()
const Tab   = createBottomTabNavigator()

const TAB_ICONS: Record<string, string> = {
  Dashboard: '⬡', Assessment: '◎', Panels: '▦', Companion: '◈', Settings: '◇',
}

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 18, color: focused ? colors.cyan : colors.text3 }}>
      {TAB_ICONS[name]}
    </Text>
  )
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle:      { backgroundColor: colors.bg1, borderTopColor: colors.border, height: 60 },
        tabBarLabelStyle: { fontSize: font.sizes.xs, marginBottom: 6 },
        tabBarActiveTintColor:   colors.cyan,
        tabBarInactiveTintColor: colors.text3,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Dashboard"  component={DashboardScreen}  />
      <Tab.Screen name="Assessment" component={AssessmentScreen} />
      <Tab.Screen name="Panels"     component={PanelsScreen}     />
      <Tab.Screen name="Companion"  component={CompanionScreen}  />
      <Tab.Screen name="Settings"   component={SettingsScreen}   />
    </Tab.Navigator>
  )
}

export function AppNavigator() {
  const [session, setSession] = useState<any>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return null // splash/loading

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.bg0 }, headerTintColor: colors.text1, headerBackTitle: '' }}>
        {!session ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Main"    component={MainTabs}    options={{ headerShown: false }} />
            <Stack.Screen name="WebView" component={WebViewScreen}
              options={({ route }) => ({ title: (route.params as any)?.title ?? 'HōMI' })}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
