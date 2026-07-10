import React, { useCallback, useMemo, useState } from 'react';
import { SectionList, StatusBar, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle, Path } from 'react-native-svg';

import { tailwind } from '@/theme';
import { TAB_BAR_HEIGHT } from '@/constants';
import { Agent } from '@/types';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { agentActions } from '@/store/agent/agentActions';
import { selectAgentsList, selectAgentsLoading } from '@/store/agent/agentSelectors';
import { AgentStatusItem } from './components/AgentStatusItem';
import i18n from '@/i18n';

type Section = { title: string; dotColor: string; data: Agent[] };

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

const CountPill = ({ color, label }: { color: string; label: string }) => (
  <Animated.View
    style={tailwind.style('flex-row items-center gap-[6px] bg-white/15 rounded-full px-3 py-[6px]')}>
    <Animated.View style={tailwind.style('w-[8px] h-[8px] rounded-full', color)} />
    <Animated.Text style={tailwind.style('text-[13px] font-inter-medium-24 text-white')}>
      {label}
    </Animated.Text>
  </Animated.View>
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

  const { sections, onlineCount, offlineCount } = useMemo(() => {
    const online = agents.filter(
      a => a.availabilityStatus === 'online' || a.availabilityStatus === 'busy',
    );
    const offline = agents.filter(
      a => !(a.availabilityStatus === 'online' || a.availabilityStatus === 'busy'),
    );
    const result: Section[] = [];
    if (online.length) {
      result.push({ title: i18n.t('AVAILABILITY.ONLINE'), dotColor: 'bg-green-600', data: online });
    }
    if (offline.length) {
      result.push({ title: i18n.t('AVAILABILITY.OFFLINE'), dotColor: 'bg-gray-400', data: offline });
    }
    return { sections: result, onlineCount: online.length, offlineCount: offline.length };
  }, [agents]);

  const renderItem = useCallback(({ item }: { item: Agent }) => <AgentStatusItem agent={item} />, []);

  const renderSectionHeader = useCallback(
    ({ section }: { section: Section }) => (
      <Animated.View style={tailwind.style('flex-row items-center gap-2 px-4 pt-4 pb-2')}>
        <Animated.View style={tailwind.style('w-[6px] h-[6px] rounded-full', section.dotColor)} />
        <Animated.Text
          style={tailwind.style(
            'text-[12px] font-inter-medium-24 tracking-[0.32px] uppercase',
            isDark ? 'text-grayDark-600' : 'text-gray-500',
          )}>
          {section.title} · {section.data.length}
        </Animated.Text>
      </Animated.View>
    ),
    [isDark],
  );

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
    <SafeAreaView style={tailwind.style('flex-1', isDark ? 'bg-grayDark-100' : 'bg-blue-800')}>
      <StatusBar
        translucent
        backgroundColor={isDark ? tailwind.color('bg-grayDark-100') : '#1e40af'}
        barStyle="light-content"
      />

      {/* Hero header */}
      <Animated.View style={tailwind.style('px-4 pt-2 pb-6')}>
        <Animated.Text style={tailwind.style('text-[26px] font-inter-580-24 text-white')}>
          {i18n.t('AGENT_STATUS.TITLE')}
        </Animated.Text>
        <Animated.View style={tailwind.style('flex-row gap-2 mt-3')}>
          {onlineCount > 0 && (
            <CountPill
              color="bg-green-400"
              label={`${onlineCount} ${i18n.t('AVAILABILITY.ONLINE')}`}
            />
          )}
          {offlineCount > 0 && (
            <CountPill
              color="bg-gray-300"
              label={`${offlineCount} ${i18n.t('AVAILABILITY.OFFLINE')}`}
            />
          )}
        </Animated.View>
      </Animated.View>

      {/* Content sheet */}
      <Animated.View
        style={tailwind.style(
          'flex-1 rounded-t-[28px] pt-2',
          isDark ? 'bg-grayDark-100' : 'bg-gray-50',
        )}>
        <SectionList
          sections={sections}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={item => String(item.id)}
          stickySectionHeadersEnabled={false}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={tailwind.style(`pb-[${TAB_BAR_HEIGHT - 1}px] flex-grow`)}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

export default AgentStatusScreen;
