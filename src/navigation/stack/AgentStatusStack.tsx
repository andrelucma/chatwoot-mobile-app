import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AgentStatusScreen from '@/screens/agent-status/AgentStatusScreen';

export type AgentStatusStackParamList = {
  AgentStatusScreen: undefined;
};

const Stack = createNativeStackNavigator<AgentStatusStackParamList>();

export const AgentStatusStack = () => {
  return (
    <Stack.Navigator initialRouteName="AgentStatusScreen">
      <Stack.Screen
        options={{ headerShown: false }}
        name="AgentStatusScreen"
        component={AgentStatusScreen}
      />
    </Stack.Navigator>
  );
};
