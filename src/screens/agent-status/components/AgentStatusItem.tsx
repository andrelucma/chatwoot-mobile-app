import React, { memo } from 'react';
import { Platform, StyleSheet, View, useColorScheme } from 'react-native';
import Animated from 'react-native-reanimated';

import { Avatar } from '@/components-next/common';
import { tailwind } from '@/theme';
import { Agent } from '@/types';
import { formatIsoDateTime } from '@/utils/dateTimeUtils';
import i18n from '@/i18n';

const STATUS_STYLES: Record<
  string,
  { dot: string; badgeBg: string; badgeText: string; accent: string }
> = {
  online: {
    dot: 'bg-green-800',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-900',
    accent: 'bg-green-600',
  },
  busy: {
    dot: 'bg-amber-800',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    accent: 'bg-amber-600',
  },
  offline: {
    dot: 'bg-gray-600',
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-700',
    accent: 'bg-gray-300',
  },
};

type AgentStatusItemProps = {
  agent: Agent;
};

export const AgentStatusItem = memo(({ agent }: AgentStatusItemProps) => {
  const isDark = useColorScheme() === 'dark';
  const { name, email, thumbnail, availabilityStatus, currentSignInAt, lastActivityAt } = agent;

  const status = availabilityStatus || 'offline';
  const isConnected = status === 'online' || status === 'busy';
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.offline;

  const timeLine = isConnected
    ? currentSignInAt &&
      `${i18n.t('AGENT_STATUS.LOGIN_LABEL')} ${formatIsoDateTime(currentSignInAt)}`
    : lastActivityAt
      ? `${i18n.t('AGENT_STATUS.LAST_ACTIVITY_LABEL')} ${formatIsoDateTime(lastActivityAt)}`
      : i18n.t('AGENT_STATUS.NEVER_ACTIVE');

  return (
    <Animated.View style={[tailwind.style('mx-4 mb-3 rounded-[16px]'), styles.cardShadow]}>
      <Animated.View
        style={tailwind.style(
          'flex flex-row overflow-hidden rounded-[16px]',
          isDark ? 'bg-grayDark-50' : 'bg-white',
        )}>
        <View style={tailwind.style('w-[4px]', statusStyle.accent)} />
        <Animated.View style={tailwind.style('flex-1 flex flex-row items-center px-4 py-[14px]')}>
          <Avatar
            size="2xl"
            name={name || ''}
            src={thumbnail ? { uri: thumbnail } : undefined}
            status={status === 'online' ? 'online' : undefined}
          />
          <Animated.View style={tailwind.style('flex-1 ml-3')}>
            <Animated.View style={tailwind.style('flex flex-row items-center justify-between')}>
              <Animated.Text
                numberOfLines={1}
                style={tailwind.style(
                  'flex-1 mr-2 text-[15px] font-inter-580-24 leading-[21px]',
                  isDark ? 'text-grayDark-950' : 'text-gray-950',
                )}>
                {name || '—'}
              </Animated.Text>
              <Animated.View
                style={tailwind.style(
                  'flex-row items-center gap-1 px-2 py-[3px] rounded-full',
                  statusStyle.badgeBg,
                )}>
                <View style={tailwind.style('w-[6px] h-[6px] rounded-full', statusStyle.dot)} />
                <Animated.Text
                  style={tailwind.style('text-[11px] font-inter-medium-24', statusStyle.badgeText)}>
                  {i18n.t(`AVAILABILITY.${status.toUpperCase()}`)}
                </Animated.Text>
              </Animated.View>
            </Animated.View>
            {email ? (
              <Animated.Text
                numberOfLines={1}
                style={tailwind.style(
                  'text-[13px] font-inter-normal-20 leading-[18px] mt-[2px]',
                  isDark ? 'text-grayDark-600' : 'text-gray-500',
                )}>
                {email}
              </Animated.Text>
            ) : null}
            <Animated.Text
              numberOfLines={1}
              style={tailwind.style(
                'text-[12px] font-inter-normal-20 leading-[16px] mt-[4px]',
                isDark ? 'text-grayDark-500' : 'text-gray-400',
              )}>
              {timeLine}
            </Animated.Text>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  cardShadow:
    Platform.select({
      ios: {
        shadowColor: '#00000040',
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 4,
        shadowOpacity: 0.3,
      },
      android: {
        elevation: 2,
      },
    }) || {},
});
