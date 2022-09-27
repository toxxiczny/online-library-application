import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import React, { useEffect } from 'react'
import SplashScreen from 'react-native-splash-screen'
import styled from 'styled-components/native'

import {
   Screens,
   navigationRef,
   theme,
   useCart,
   useChatDetails,
   useRole,
} from '@online-library/core'

import { moderateScale } from 'styles'

import { TabBarIcon } from './shared/styled'

import {
   CartScreen,
   ChatScreen,
   EmailSupportScreen,
   HomeScreen,
   LoginScreen,
   PasswordSupportScreen,
   ProfileScreen,
   RegistrationScreen,
   StoreScreen,
} from './screens'

const Tab = createBottomTabNavigator<Screens>()

const screenOptions = {
   headerShown: false,
   tabBarStyle: { backgroundColor: theme.colors.primary },
   tabBarLabelStyle: { display: 'none' },
   tabBarItemStyle: { justifyContent: 'center' },
   tabBarBadgeStyle: {
      backgroundColor: 'white',
      fontSize: moderateScale(10),
      marginLeft: moderateScale(10),
   },
} as object

export const App = () => {
   const { role } = useRole()

   const { cart } = useCart()

   const { unreadMessagesAmount } = useChatDetails()

   useEffect(() => SplashScreen.hide(), [])

   return (
      <AppContainer>
         <NavigationContainer ref={navigationRef}>
            {role === 'guest' ? (
               <Tab.Navigator initialRouteName="Home" screenOptions={screenOptions}>
                  <Tab.Screen
                     name="Home"
                     component={HomeScreen}
                     options={{ tabBarIcon: () => <TabBarIcon>Home</TabBarIcon> }}
                  />
                  <Tab.Screen
                     name="Registration"
                     component={RegistrationScreen}
                     options={{ tabBarIcon: () => <TabBarIcon>Registration</TabBarIcon> }}
                  />
                  <Tab.Screen
                     name="Login"
                     component={LoginScreen}
                     options={{ tabBarIcon: () => <TabBarIcon>Login</TabBarIcon> }}
                  />
                  <Tab.Screen
                     name="EmailSupport"
                     component={EmailSupportScreen}
                     options={{ tabBarItemStyle: { display: 'none' } }}
                  />
                  <Tab.Screen
                     name="PasswordSupport"
                     component={PasswordSupportScreen}
                     options={{ tabBarItemStyle: { display: 'none' } }}
                  />
               </Tab.Navigator>
            ) : (
               <Tab.Navigator
                  initialRouteName="Store"
                  screenOptions={({ route }) => ({
                     ...screenOptions,
                     tabBarIcon: ({ focused }) => (
                        <TabBarIcon isFocused={focused}>{route.name}</TabBarIcon>
                     ),
                  })}
               >
                  <Tab.Screen name="Store" component={StoreScreen} />
                  <Tab.Screen name="Profile" component={ProfileScreen} />
                  <Tab.Screen
                     name="Cart"
                     component={CartScreen}
                     options={{
                        ...(!!cart.length && { tabBarBadge: cart.length <= 99 ? cart.length : 99 }),
                     }}
                  />
                  <Tab.Screen
                     name="Chat"
                     component={ChatScreen}
                     options={{
                        ...(unreadMessagesAmount && {
                           tabBarBadge: unreadMessagesAmount <= 99 ? unreadMessagesAmount : 99,
                        }),
                     }}
                  />
               </Tab.Navigator>
            )}
         </NavigationContainer>
      </AppContainer>
   )
}

const AppContainer = styled.View`
   flex: 1;
`
