/* eslint-disable react/display-name */
import React, { memo } from 'react';
import { ImageURISource } from 'react-native';

import { NativeView } from '@/components-next/native-components';
import { tailwind } from '@/theme';
import {
  Agent,
  AvailabilityStatus,
  ConversationAdditionalAttributes,
  ConversationPriority,
  Label,
  Message,
} from '@/types';
import { Inbox } from '@/types/Inbox';

import { ConversationAvatar } from './ConversationAvatar';
import { ConversationItemDetail } from './ConversationItemDetail';
import { ConversationSelect } from './ConversationSelect';
import { SLA } from '@/types/common/SLA';

export type ConversationItemProps = {
  // Basic info
  id: number;
  senderName: string | null;
  senderThumbnail: string | null;
  isSelected: boolean;
  unreadCount: number;
  isTyping: boolean;
  availabilityStatus: AvailabilityStatus;

  priority?: ConversationPriority | null;
  labels: string[];
  timestamp: number;
  inbox: Inbox | null;
  lastMessage?: Message | null;
  inboxId: number;
  assignee: Agent | null;

  // SLA related
  slaPolicyId?: number | null;
  appliedSla?: SLA | null;
  appliedSlaConversationDetails?:
    | {
        firstReplyCreatedAt: number;
        waitingSince: number;
        status: string;
      }
    | Record<string, never>;

  // Additional data
  additionalAttributes?: ConversationAdditionalAttributes;

  // Conversation header state
  currentState: string;

  allLabels: Label[];

  typingText?: string;
};

export const ConversationItem = memo(
  ({
    id,
    senderName,
    senderThumbnail,
    isSelected,
    currentState,
    unreadCount,
    isTyping,
    availabilityStatus,
    priority = null,
    labels,
    timestamp,
    inbox,
    lastMessage,
    inboxId,
    assignee,
    slaPolicyId = null,
    appliedSla = null,
    appliedSlaConversationDetails = {},
    additionalAttributes,
    allLabels,
    typingText,
  }: ConversationItemProps) => {
    const isUnread = unreadCount >= 1;
    return (
      <NativeView style={tailwind.style(
        `gap-3 flex-row justify-between mx-3 mb-2 rounded-2xl overflow-hidden ${isUnread ? 'bg-blue-50 dark:bg-blueDark-200 border-l-[3px] border-l-blue-700 dark:border-l-blueDark-600 pl-[9px] pr-3' : 'bg-white dark:bg-grayDark-100 px-3 border border-gray-200 dark:border-grayDark-300'}`
      )}>
        <NativeView style={tailwind.style('py-3 flex flex-row')}>
          <ConversationSelect {...{ isSelected, currentState }} />
          <ConversationAvatar
            src={{ uri: senderThumbnail } as ImageURISource}
            name={senderName || ''}
            status={isTyping ? 'typing' : availabilityStatus || 'offline'}
          />
        </NativeView>

        <ConversationItemDetail
          {...{
            id,
            priority: priority,
            unreadCount,
            labels,
            assignee,
            senderName,
            timestamp,
            inbox,
            lastMessage,
            inboxId,
            appliedSla,
            appliedSlaConversationDetails,
            additionalAttributes,
            slaPolicyId,
            currentState,
            allLabels,
            typingText,
          }}
        />
      </NativeView>
    );
  },
);
