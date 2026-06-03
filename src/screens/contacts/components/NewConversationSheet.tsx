import React, { useCallback, useState } from 'react';
import { Alert, Pressable, useColorScheme } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { StackActions, useNavigation } from '@react-navigation/native';

import { tailwind } from '@/theme';
import { Contact } from '@/types';
import { ContactableInbox, WhatsAppTemplate, WhatsAppTemplateParams } from '@/store/contact/contactTypes';
import { useAppDispatch } from '@/hooks';
import { contactActions } from '@/store/contact/contactActions';
import { togglePrivateMessage } from '@/store/conversation/sendMessageSlice';
import { Button } from '@/components-next';
import { isAWhatsAppCloudChannel } from '@/utils/inboxUtils';
import i18n from '@/i18n';

type NewConversationSheetProps = {
  contact: Contact;
  sheetRef: React.RefObject<BottomSheetModal | null>;
};

export const NewConversationSheet = ({ contact, sheetRef }: NewConversationSheetProps) => {
  const isDark = useColorScheme() === 'dark';
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const [inboxes, setInboxes] = useState<ContactableInbox[]>([]);
  const [selectedInbox, setSelectedInbox] = useState<ContactableInbox | null>(null);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingInboxes, setLoadingInboxes] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const snapPoints = ['70%', '90%'];

  const handleSheetOpen = useCallback(async () => {
    setSelectedInbox(null);
    setTemplates([]);
    setSelectedTemplate(null);
    setLoadingInboxes(true);
    try {
      const result = await dispatch(
        contactActions.getContactableInboxes(contact.id),
      ).unwrap();
      setInboxes(result);
      if (result.length === 1) {
        const inbox = result[0].inbox;
        setSelectedInbox(result[0]);
        if (isAWhatsAppCloudChannel(inbox)) {
          fetchTemplates(inbox.id);
        }
      }
    } catch {
      Alert.alert(i18n.t('CONTACTS.ERROR'), i18n.t('CONTACTS.INBOXES_LOAD_ERROR'));
    } finally {
      setLoadingInboxes(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact.id, dispatch]);

  const fetchTemplates = useCallback(async (inboxId: number) => {
    setLoadingTemplates(true);
    setTemplates([]);
    setSelectedTemplate(null);
    try {
      const result = await dispatch(contactActions.getWhatsAppTemplates(inboxId)).unwrap();
      setTemplates(result);
    } catch {
      // templates unavailable, user can still start conversation without template
    } finally {
      setLoadingTemplates(false);
    }
  }, [dispatch]);

  const handleSelectInbox = useCallback((item: ContactableInbox) => {
    setSelectedInbox(item);
    setTemplates([]);
    setSelectedTemplate(null);
    if (isAWhatsAppCloudChannel(item.inbox)) {
      fetchTemplates(item.inbox.id);
    }
  }, [fetchTemplates]);

  const getTemplateBody = (template: WhatsAppTemplate) => {
    const body = template.components.find(c => c.type === 'BODY');
    return body?.text || '';
  };

  const handleStartConversation = useCallback(async () => {
    if (!selectedInbox) return;
    const isWhatsApp = isAWhatsAppCloudChannel(selectedInbox.inbox);
    if (isWhatsApp && templates.length > 0 && !selectedTemplate) {
      Alert.alert(i18n.t('CONTACTS.ERROR'), i18n.t('CONTACTS.SELECT_TEMPLATE_REQUIRED'));
      return;
    }

    setLoading(true);
    try {
      const templateParams: WhatsAppTemplateParams | undefined = selectedTemplate
        ? {
            name: selectedTemplate.name,
            category: selectedTemplate.category,
            language: selectedTemplate.language,
            processed_params: {},
          }
        : undefined;

      const templateBody = selectedTemplate ? getTemplateBody(selectedTemplate) : undefined;

      const conversation = await dispatch(
        contactActions.createConversation({
          contactId: contact.id,
          inboxId: selectedInbox.inbox.id,
          sourceId: selectedInbox.sourceId,
          templateParams,
          message: templateBody,
        }),
      ).unwrap();
      sheetRef.current?.dismiss();
      dispatch(togglePrivateMessage(false));
      navigation.dispatch(
        StackActions.push('ChatScreen', { conversationId: conversation.id }),
      );
    } catch {
      Alert.alert(i18n.t('CONTACTS.ERROR'), i18n.t('CONTACTS.CONVERSATION_CREATE_ERROR'));
    } finally {
      setLoading(false);
    }
  }, [contact.id, dispatch, navigation, selectedInbox, selectedTemplate, sheetRef, templates.length]);

  const sectionLabel = (text: string) => (
    <Animated.Text
      style={tailwind.style(
        'text-xs font-inter-medium-24 tracking-[0.5px] uppercase mb-2 mt-5 px-4',
        isDark ? 'text-grayDark-600' : 'text-gray-500',
      )}>
      {text}
    </Animated.Text>
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      onAnimate={(fromIndex, toIndex) => fromIndex === -1 && toIndex === 0 && handleSheetOpen()}
      backgroundStyle={tailwind.style(isDark ? 'bg-grayDark-100' : 'bg-white')}
      handleIndicatorStyle={tailwind.style(isDark ? 'bg-grayDark-400' : 'bg-gray-300')}>
      <BottomSheetScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={tailwind.style('pb-8')}>
        <Animated.View
          style={tailwind.style(
            'flex flex-row items-center justify-between px-4 pb-3 border-b-[1px]',
            isDark ? 'border-b-grayDark-300' : 'border-b-gray-100',
          )}>
          <Animated.Text
            style={tailwind.style(
              'text-lg font-inter-580-24',
              isDark ? 'text-grayDark-950' : 'text-gray-950',
            )}>
            {i18n.t('CONTACTS.NEW_CONVERSATION')}
          </Animated.Text>
          <Pressable onPress={() => sheetRef.current?.dismiss()} hitSlop={12}>
            <Animated.Text
              style={tailwind.style('text-base', isDark ? 'text-grayDark-600' : 'text-gray-500')}>
              ✕
            </Animated.Text>
          </Pressable>
        </Animated.View>

        {sectionLabel(i18n.t('CONTACTS.CONTACT'))}
        <Animated.View style={tailwind.style('px-4')}>
          <Animated.Text
            style={tailwind.style(
              'text-base font-inter-normal-20',
              isDark ? 'text-grayDark-950' : 'text-gray-900',
            )}>
            {contact.name || '—'}
          </Animated.Text>
          {contact.email && (
            <Animated.Text
              style={tailwind.style('text-sm mt-0.5', isDark ? 'text-grayDark-600' : 'text-gray-500')}>
              {contact.email}
            </Animated.Text>
          )}
        </Animated.View>

        {sectionLabel(i18n.t('CONTACTS.SELECT_INBOX'))}
        {loadingInboxes ? (
          <Animated.Text style={tailwind.style('px-4 text-sm text-gray-500')}>
            {i18n.t('CONTACTS.LOADING')}
          </Animated.Text>
        ) : inboxes.length === 0 ? (
          <Animated.Text style={tailwind.style('px-4 text-sm text-gray-500')}>
            {i18n.t('CONTACTS.NO_INBOXES')}
          </Animated.Text>
        ) : (
          inboxes.map(item => {
            const isSelected = selectedInbox?.inbox.id === item.inbox.id;
            return (
              <Pressable
                key={item.inbox.id}
                onPress={() => handleSelectInbox(item)}
                style={tailwind.style(
                  'flex flex-row items-center px-4 py-3 mx-4 mb-2 rounded-xl border',
                  isSelected
                    ? 'border-blue-700 bg-blue-50'
                    : isDark
                      ? 'border-grayDark-300 bg-grayDark-200'
                      : 'border-gray-200 bg-gray-50',
                )}>
                <Animated.View
                  style={tailwind.style(
                    'w-4 h-4 rounded-full border mr-3',
                    isSelected ? 'border-blue-700 bg-blue-700' : 'border-gray-400',
                  )}
                />
                <Animated.Text
                  style={tailwind.style(
                    'text-base font-inter-normal-20',
                    isDark ? 'text-grayDark-950' : 'text-gray-900',
                  )}>
                  {item.inbox.name}
                </Animated.Text>
              </Pressable>
            );
          })
        )}

        {selectedInbox && isAWhatsAppCloudChannel(selectedInbox.inbox) && (
          <>
            {sectionLabel(i18n.t('CONTACTS.SELECT_TEMPLATE'))}
            {loadingTemplates ? (
              <Animated.Text style={tailwind.style('px-4 text-sm text-gray-500')}>
                {i18n.t('CONTACTS.LOADING')}
              </Animated.Text>
            ) : templates.length === 0 ? (
              <Animated.Text style={tailwind.style('px-4 text-sm text-gray-500')}>
                {i18n.t('CONTACTS.NO_TEMPLATES')}
              </Animated.Text>
            ) : (
              templates.map(template => {
                const isSelected = selectedTemplate?.id === template.id;
                const bodyText = getTemplateBody(template);
                return (
                  <Pressable
                    key={template.id}
                    onPress={() => setSelectedTemplate(isSelected ? null : template)}
                    style={tailwind.style(
                      'px-4 py-3 mx-4 mb-2 rounded-xl border',
                      isSelected
                        ? 'border-blue-700 bg-blue-50'
                        : isDark
                          ? 'border-grayDark-300 bg-grayDark-200'
                          : 'border-gray-200 bg-gray-50',
                    )}>
                    <Animated.View style={tailwind.style('flex flex-row items-center mb-1')}>
                      <Animated.View
                        style={tailwind.style(
                          'w-4 h-4 rounded-full border mr-3 flex-shrink-0',
                          isSelected ? 'border-blue-700 bg-blue-700' : 'border-gray-400',
                        )}
                      />
                      <Animated.Text
                        style={tailwind.style(
                          'text-base font-inter-medium-24',
                          isDark ? 'text-grayDark-950' : 'text-gray-900',
                        )}>
                        {template.name}
                      </Animated.Text>
                    </Animated.View>
                    {bodyText ? (
                      <Animated.Text
                        numberOfLines={2}
                        style={tailwind.style(
                          'text-sm ml-7',
                          isDark ? 'text-grayDark-600' : 'text-gray-500',
                        )}>
                        {bodyText}
                      </Animated.Text>
                    ) : null}
                  </Pressable>
                );
              })
            )}
          </>
        )}

        <Animated.View style={tailwind.style('px-4 mt-6')}>
          <Button
            text={loading ? i18n.t('CONTACTS.LOADING') : i18n.t('CONTACTS.START_CONVERSATION')}
            handlePress={handleStartConversation}
            disabled={!selectedInbox || loading}
          />
        </Animated.View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};
