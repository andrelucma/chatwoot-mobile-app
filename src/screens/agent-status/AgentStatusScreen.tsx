import React, { useCallback, useState } from 'react';
import { FlatList, Platform, useColorScheme } from 'react-native';
import Animated from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle, Path } from 'react-native-svg';

import { tailwind } from '@/theme';
import { Agent } from '@/types';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { agentActions } from '@/store/agent/agentActions';
import { selectAgentsList, selectAgentsLoading } from '@/store/agent/agentSelectors';
import { AgentStatusItem } from './components/AgentStatusItem';
import i18n from '@/i18n';

const EmptyAgentsIcon = () => (
  <Svg width="80" height="80" viewBox="0 0 64 64" fill="none">
    <Circle cx="24" cy="20" r="9" fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="2" />
    <Path
      d="M8 48C8 39.163 15.163 32 24 32C32.837 32 40 39.163 40 48"
      stroke="#1D4ED8"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Circle cx="44" cy="24" r="7" fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="2" />
    <Path
      d="M40 33C48.008 34.663 54 41.146 54 48"
      stroke="#1D4ED8"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const AgentStatusScreen = () => {
  const isDark = useColorScheme() === 'dark';
  const dispatch = useAppDispatch();

  const agents = useAppSelector(selectAgentsList);
  const isLoading = useAppSelector(selectAgentsLoading);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAgents = useCallback(async () => {
    try {
      await dispatch(agentActions.fetchAgents()).unwrap();
    } catch {
      // silently fail, list keeps previous data
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      fetchAgents();
    }, [fetchAgents]),
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAgents();
  }, [fetchAgents]);

  const renderItem = useCallback(({ item }: { item: Agent }) => <AgentStatusItem agent={item} />, []);

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <Animated.View style={tailwind.style('flex-1 items-center justify-center py-16')}>
        <EmptyAgentsIcon />
        <Animated.Text
          style={tailwind.style(
            'text-base font-inter-580-24 mt-5',
            isDark ? 'text-grayDark-700' : 'text-gray-700',
          )}>
          {i18n.t('AGENT_STATUS.EMPTY_STATE')}
        </Animated.Text>
      </Animated.View>
    );
  };

  return (
    <Animated.View
      style={tailwind.style(
        `flex-1 ${Platform.OS === 'android' ? 'pt-12' : 'pt-14'}`,
        isDark ? 'bg-grayDark-50' : 'bg-white',
      )}>
      {/* Header */}
      <Animated.View style={tailwind.style('px-4 pt-2 pb-3')}>
        <Animated.Text
          style={tailwind.style(
            'text-[28px] font-inter-580-24 leading-[34px]',
            isDark ? 'text-grayDark-950' : 'text-gray-950',
          )}>
          {i18n.t('AGENT_STATUS.TITLE')}
        </Animated.Text>
        {agents.length > 0 && (
          <Animated.View style={tailwind.style('flex flex-row items-center mt-[4px] gap-[6px]')}>
            <Animated.View style={tailwind.style('w-[6px] h-[6px] rounded-full bg-blue-700')} />
            <Animated.Text style={tailwind.style('text-[13px] font-inter-normal-20 text-blue-700')}>
              {agents.length} {i18n.t('AGENT_STATUS.AGENTS_COUNT')}
            </Animated.Text>
          </Animated.View>
        )}
      </Animated.View>

      {/* List */}
      <FlatList
        data={agents}
        renderItem={renderItem}
        keyExtractor={item => String(item.id)}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={tailwind.style('pb-4 flex-grow')}
      />
    </Animated.View>
  );
};

export default AgentStatusScreen;
