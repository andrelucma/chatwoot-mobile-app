import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, useColorScheme, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { StackActions, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { tailwind } from '@/theme';
import { ContactableInbox, WhatsAppTemplate, WhatsAppTemplateParams } from '@/store/contact/contactTypes';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { contactActions } from '@/store/contact/contactActions';
import { togglePrivateMessage } from '@/store/conversation/sendMessageSlice';
import { isAWhatsAppCloudChannel } from '@/utils/inboxUtils';
import { selectContactById } from '@/store/contact/contactSelectors';
import { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';
import i18n from '@/i18n';

type Props = NativeStackScreenProps<TabBarExcludedScreenParamList, 'NewConversationScreen'>;

const NewConversationScreen = ({ route }: Props) => {
  const { contactId } = route.params;
  const isDark = useColorScheme() === 'dark';
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const contact = useAppSelector(state => selectContactById(state, contactId));

  const [inboxes, setInboxes] = useState<ContactableInbox[]>([]);
  const [selectedInbox, setSelectedInbox] = useState<ContactableInbox | null>(null);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingInboxes, setLoadingInboxes] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

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

  useEffect(() => {
    const loadInboxes = async () => {
      setLoadingInboxes(true);
      try {
        const result = await dispatch(
          contactActions.getContactableInboxes(contactId),
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
    };
    loadInboxes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Meta templates use positional placeholders ({{1}}, {{2}}, ...). The only
  // contact data available here is the name. Without a name we leave the
  // template untouched instead of filling placeholders with an empty string,
  // which would leave stray spaces/punctuation behind.
  const buildProcessedParams = (bodyText: string, contactName: string): Record<string, string> => {
    const trimmedName = contactName.trim();
    if (!trimmedName) return {};
    const params: Record<string, string> = {};
    for (const match of bodyText.matchAll(/{{\s*(\d+)\s*}}/g)) {
      params[match[1]] = trimmedName;
    }
    return params;
  };

  const substituteTemplateBody = (bodyText: string, params: Record<string, string>) =>
    bodyText.replace(/{{\s*(\d+)\s*}}/g, (match, position) => params[position] ?? match);

  const handleStartConversation = useCallback(async () => {
    if (!selectedInbox) return;
    const isWhatsApp = isAWhatsAppCloudChannel(selectedInbox.inbox);
    if (isWhatsApp && templates.length > 0 && !selectedTemplate) {
      Alert.alert(i18n.t('CONTACTS.ERROR'), i18n.t('CONTACTS.SELECT_TEMPLATE_REQUIRED'));
      return;
    }

    setLoading(true);
    try {
      const rawTemplateBody = selectedTemplate ? getTemplateBody(selectedTemplate) : undefined;
      const processedParams = rawTemplateBody
        ? buildProcessedParams(rawTemplateBody, contact.name || '')
        : {};

      const templateParams: WhatsAppTemplateParams | undefined = selectedTemplate
        ? {
            name: selectedTemplate.name,
            category: selectedTemplate.category,
            language: selectedTemplate.language,
            processed_params: processedParams,
          }
        : undefined;

      const templateBody = rawTemplateBody
        ? substituteTemplateBody(rawTemplateBody, processedParams)
        : undefined;

      const conversation = await dispatch(
        contactActions.createConversation({
          contactId,
          inboxId: selectedInbox.inbox.id,
          sourceId: selectedInbox.sourceId,
          templateParams,
          message: templateBody,
        }),
      ).unwrap();
      dispatch(togglePrivateMessage(false));
      navigation.dispatch(
        StackActions.replace('ChatScreen', { conversationId: conversation.id }),
      );
    } catch {
      Alert.alert(i18n.t('CONTACTS.ERROR'), i18n.t('CONTACTS.CONVERSATION_CREATE_ERROR'));
    } finally {
      setLoading(false);
    }
  }, [contact.name, contactId, dispatch, navigation, selectedInbox, selectedTemplate, templates.length]);

  if (!contact) return null;

  return (
    <View style={tailwind.style('flex-1')}>
      {/* Blue header */}
      <Animated.View
        style={tailwind.style(
          `bg-blue-800 px-4 pb-5 ${Platform.OS === 'android' ? 'pt-12' : 'pt-14'}`,
        )}>
        <Animated.View style={tailwind.style('flex flex-row items-center justify-between')}>
          <Pressable onPress={() => navigation.dispatch(StackActions.pop())} hitSlop={12}>
            <Animated.Text style={tailwind.style('text-base text-white opacity-80')}>
              {i18n.t('CONTACTS.CANCEL')}
            </Animated.Text>
          </Pressable>
          <Animated.Text style={tailwind.style('text-lg font-inter-580-24 text-white')}>
            {i18n.t('CONTACTS.NEW_CONVERSATION')}
          </Animated.Text>
          <Pressable onPress={() => navigation.dispatch(StackActions.pop(2))} hitSlop={12}>
            <Animated.Text style={tailwind.style('text-base text-white opacity-80')}>
              {i18n.t('CONTACTS.CLOSE_LIST')}
            </Animated.Text>
          </Pressable>
        </Animated.View>
      </Animated.View>

      {/* Body */}
      <Animated.View style={tailwind.style('flex-1', isDark ? 'bg-grayDark-100' : 'bg-gray-50')}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={tailwind.style('px-4 pt-5 pb-12')}>

          {/* Contact card */}
          <Animated.Text
            style={tailwind.style(
              'text-[11px] font-inter-medium-24 tracking-[0.6px] uppercase mb-2 px-1',
              isDark ? 'text-grayDark-600' : 'text-gray-400',
            )}>
            {i18n.t('CONTACTS.CONTACT')}
          </Animated.Text>
          <Animated.View
            style={tailwind.style(
              'rounded-2xl px-4 py-3 mb-5',
              isDark ? 'bg-grayDark-50' : 'bg-white',
            )}>
            <Animated.Text
              style={tailwind.style(
                'text-[15px] font-inter-normal-20',
                isDark ? 'text-grayDark-950' : 'text-gray-900',
              )}>
              {contact.name || '—'}
            </Animated.Text>
            {contact.email ? (
              <Animated.Text
                style={tailwind.style(
                  'text-sm mt-0.5',
                  isDark ? 'text-grayDark-600' : 'text-gray-500',
                )}>
                {contact.email}
              </Animated.Text>
            ) : null}
          </Animated.View>

          {/* Inbox card */}
          <Animated.Text
            style={tailwind.style(
              'text-[11px] font-inter-medium-24 tracking-[0.6px] uppercase mb-2 px-1',
              isDark ? 'text-grayDark-600' : 'text-gray-400',
            )}>
            {i18n.t('CONTACTS.SELECT_INBOX')}
          </Animated.Text>
          <Animated.View
            style={tailwind.style(
              'rounded-2xl overflow-hidden mb-5',
              isDark ? 'bg-grayDark-50' : 'bg-white',
            )}>
            {loadingInboxes ? (
              <Animated.Text style={tailwind.style('px-4 py-3 text-sm', isDark ? 'text-grayDark-600' : 'text-gray-500')}>
                {i18n.t('CONTACTS.LOADING')}
              </Animated.Text>
            ) : inboxes.length === 0 ? (
              <Animated.Text style={tailwind.style('px-4 py-3 text-sm', isDark ? 'text-grayDark-600' : 'text-gray-500')}>
                {i18n.t('CONTACTS.NO_INBOXES')}
              </Animated.Text>
            ) : (
              inboxes.map((item, index) => {
                const isSelected = selectedInbox?.inbox.id === item.inbox.id;
                return (
                  <Animated.View key={item.inbox.id}>
                    {index > 0 && (
                      <Animated.View
                        style={tailwind.style(
                          'h-[1px] ml-[52px]',
                          isDark ? 'bg-grayDark-200' : 'bg-gray-100',
                        )}
                      />
                    )}
                    <Pressable
                      onPress={() => handleSelectInbox(item)}
                      style={tailwind.style('flex flex-row items-center px-4 py-[14px]')}>
                      <Animated.View
                        style={tailwind.style(
                          'w-5 h-5 rounded-full border-2 mr-3 items-center justify-center',
                          isSelected ? 'border-blue-700' : isDark ? 'border-grayDark-400' : 'border-gray-300',
                        )}>
                        {isSelected && (
                          <Animated.View
                            style={tailwind.style('w-2.5 h-2.5 rounded-full bg-blue-700')}
                          />
                        )}
                      </Animated.View>
                      <Animated.Text
                        style={tailwind.style(
                          'text-[15px] font-inter-normal-20 flex-1',
                          isSelected
                            ? 'text-blue-700'
                            : isDark ? 'text-grayDark-950' : 'text-gray-900',
                        )}>
                        {item.inbox.name}
                      </Animated.Text>
                    </Pressable>
                  </Animated.View>
                );
              })
            )}
          </Animated.View>

          {/* Templates card (WhatsApp only) */}
          {selectedInbox && isAWhatsAppCloudChannel(selectedInbox.inbox) && (
            <>
              <Animated.Text
                style={tailwind.style(
                  'text-[11px] font-inter-medium-24 tracking-[0.6px] uppercase mb-2 px-1',
                  isDark ? 'text-grayDark-600' : 'text-gray-400',
                )}>
                {i18n.t('CONTACTS.SELECT_TEMPLATE')}
              </Animated.Text>
              <Animated.View
                style={tailwind.style(
                  'rounded-2xl overflow-hidden mb-5',
                  isDark ? 'bg-grayDark-50' : 'bg-white',
                )}>
                {loadingTemplates ? (
                  <Animated.Text style={tailwind.style('px-4 py-3 text-sm', isDark ? 'text-grayDark-600' : 'text-gray-500')}>
                    {i18n.t('CONTACTS.LOADING')}
                  </Animated.Text>
                ) : templates.length === 0 ? (
                  <Animated.Text style={tailwind.style('px-4 py-3 text-sm', isDark ? 'text-grayDark-600' : 'text-gray-500')}>
                    {i18n.t('CONTACTS.NO_TEMPLATES')}
                  </Animated.Text>
                ) : (
                  templates.map((template, index) => {
                    const isSelected = selectedTemplate?.id === template.id;
                    const bodyText = getTemplateBody(template);
                    return (
                      <Animated.View key={template.id}>
                        {index > 0 && (
                          <Animated.View
                            style={tailwind.style(
                              'h-[1px] ml-[52px]',
                              isDark ? 'bg-grayDark-200' : 'bg-gray-100',
                            )}
                          />
                        )}
                        <Pressable
                          onPress={() => setSelectedTemplate(isSelected ? null : template)}
                          style={tailwind.style('flex flex-row items-start px-4 py-[14px]')}>
                          <Animated.View
                            style={tailwind.style(
                              'w-5 h-5 rounded-full border-2 mr-3 mt-[2px] items-center justify-center flex-shrink-0',
                              isSelected ? 'border-blue-700' : isDark ? 'border-grayDark-400' : 'border-gray-300',
                            )}>
                            {isSelected && (
                              <Animated.View
                                style={tailwind.style('w-2.5 h-2.5 rounded-full bg-blue-700')}
                              />
                            )}
                          </Animated.View>
                          <Animated.View style={tailwind.style('flex-1')}>
                            <Animated.Text
                              style={tailwind.style(
                                'text-[15px] font-inter-medium-24',
                                isSelected
                                  ? 'text-blue-700'
                                  : isDark ? 'text-grayDark-950' : 'text-gray-900',
                              )}>
                              {template.name}
                            </Animated.Text>
                            {bodyText ? (
                              <Animated.Text
                                numberOfLines={2}
                                style={tailwind.style(
                                  'text-sm mt-0.5',
                                  isDark ? 'text-grayDark-600' : 'text-gray-500',
                                )}>
                                {bodyText}
                              </Animated.Text>
                            ) : null}
                          </Animated.View>
                        </Pressable>
                      </Animated.View>
                    );
                  })
                )}
              </Animated.View>
            </>
          )}

          {/* Start button */}
          <Pressable
            onPress={handleStartConversation}
            disabled={!selectedInbox || loading}
            style={({ pressed }) =>
              tailwind.style(
                'py-[15px] rounded-2xl items-center justify-center bg-blue-800',
                !selectedInbox || loading ? 'opacity-50' : pressed ? 'opacity-75' : '',
              )
            }>
            <Animated.Text style={tailwind.style('text-base font-inter-580-24 text-white tracking-[0.2px]')}>
              {loading ? i18n.t('CONTACTS.LOADING') : i18n.t('CONTACTS.START_CONVERSATION')}
            </Animated.Text>
          </Pressable>

        </ScrollView>
      </Animated.View>
    </View>
  );
};

export default NewConversationScreen;
