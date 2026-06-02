import React, { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, useColorScheme } from 'react-native';
import Animated from 'react-native-reanimated';
import { StackActions, useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { tailwind } from '@/theme';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { contactActions } from '@/store/contact/contactActions';
import { selectContactById } from '@/store/contact/contactSelectors';
import { Button } from '@/components-next';
import { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';
import i18n from '@/i18n';

type RouteProps = RouteProp<TabBarExcludedScreenParamList, 'ContactFormScreen'>;

type FieldConfig = {
  key: 'name' | 'email' | 'phoneNumber' | 'companyName' | 'location';
  label: string;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
};

const FIELDS: FieldConfig[] = [
  { key: 'name', label: i18n.t('CONTACTS.NAME'), placeholder: i18n.t('CONTACTS.NAME_PLACEHOLDER'), keyboardType: 'default' },
  { key: 'email', label: i18n.t('CONTACTS.EMAIL'), placeholder: i18n.t('CONTACTS.EMAIL_PLACEHOLDER'), keyboardType: 'email-address' },
  { key: 'phoneNumber', label: i18n.t('CONTACTS.PHONE'), placeholder: i18n.t('CONTACTS.PHONE_PLACEHOLDER'), keyboardType: 'phone-pad' },
  { key: 'companyName', label: i18n.t('CONTACTS.COMPANY'), placeholder: i18n.t('CONTACTS.COMPANY_PLACEHOLDER'), keyboardType: 'default' },
  { key: 'location', label: i18n.t('CONTACTS.LOCATION'), placeholder: i18n.t('CONTACTS.LOCATION_PLACEHOLDER'), keyboardType: 'default' },
];

const ContactFormScreen = () => {
  const isDark = useColorScheme() === 'dark';
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();

  const { contactId } = route.params || {};
  const isEdit = !!contactId;
  const existingContact = useAppSelector(state =>
    contactId ? selectContactById(state, contactId) : null,
  );

  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneNumber: '+55',
    companyName: '',
    location: 'Brasil',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingContact) {
      setForm({
        name: existingContact.name || '',
        email: existingContact.email || '',
        phoneNumber: existingContact.phoneNumber || '',
        companyName: existingContact.additionalAttributes?.companyName || '',
        location: existingContact.additionalAttributes?.location || '',
      });
    }
  }, [existingContact]);

  const handleChange = useCallback((key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) {
      Alert.alert(i18n.t('CONTACTS.ERROR'), i18n.t('CONTACTS.NAME_REQUIRED'));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phoneNumber: form.phoneNumber.trim() || undefined,
        additionalAttributes: {
          companyName: form.companyName.trim() || undefined,
          location: form.location.trim() || undefined,
        },
      };

      if (isEdit && contactId) {
        await dispatch(contactActions.updateContact({ contactId, ...payload })).unwrap();
      } else {
        await dispatch(contactActions.createContact(payload)).unwrap();
      }
      navigation.dispatch(StackActions.pop());
    } catch (err) {
      const msg = (typeof err === 'string' && err) ? err : i18n.t('CONTACTS.SAVE_ERROR');
      Alert.alert(i18n.t('CONTACTS.ERROR'), msg);
    } finally {
      setSaving(false);
    }
  }, [contactId, dispatch, form, isEdit, navigation]);

  const inputStyle = tailwind.style(
    'rounded-xl px-3 py-3 text-base mt-1 mb-4',
    isDark ? 'bg-grayDark-200 text-grayDark-950' : 'bg-gray-50 text-gray-900',
  );

  const labelStyle = tailwind.style(
    'text-sm font-inter-medium-24',
    isDark ? 'text-grayDark-600' : 'text-gray-600',
  );

  return (
    <KeyboardAvoidingView
      style={tailwind.style('flex-1')}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Animated.View
        style={tailwind.style(
          `flex-1 ${Platform.OS === 'android' ? 'pt-12' : 'pt-14'}`,
          isDark ? 'bg-grayDark-50' : 'bg-white',
        )}>
        <Animated.View
          style={tailwind.style(
            'flex flex-row items-center justify-between px-4 pb-3 border-b-[1px]',
            isDark ? 'border-b-grayDark-300' : 'border-b-gray-100',
          )}>
          <Pressable onPress={() => navigation.dispatch(StackActions.pop())} hitSlop={12}>
            <Animated.Text style={tailwind.style('text-base text-blue-700')}>
              {i18n.t('CONTACTS.CANCEL')}
            </Animated.Text>
          </Pressable>
          <Animated.Text
            style={tailwind.style(
              'text-lg font-inter-580-24',
              isDark ? 'text-grayDark-950' : 'text-gray-950',
            )}>
            {isEdit ? i18n.t('CONTACTS.EDIT_CONTACT') : i18n.t('CONTACTS.NEW_CONTACT')}
          </Animated.Text>
          <Pressable onPress={handleSave} disabled={saving} hitSlop={12}>
            <Animated.Text
              style={tailwind.style(
                'text-base font-inter-medium-24',
                saving ? 'text-gray-400' : 'text-blue-700',
              )}>
              {i18n.t('CONTACTS.SAVE')}
            </Animated.Text>
          </Pressable>
        </Animated.View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={tailwind.style('px-4 pt-4 pb-12')}>
          {FIELDS.map(field => (
            <Animated.View key={field.key}>
              <Animated.Text style={labelStyle}>{field.label}</Animated.Text>
              <TextInput
                value={form[field.key]}
                onChangeText={text => handleChange(field.key, text)}
                placeholder={field.placeholder}
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                keyboardType={field.keyboardType || 'default'}
                autoCapitalize={field.key === 'email' ? 'none' : 'words'}
                style={inputStyle}
              />
            </Animated.View>
          ))}

          <Animated.View style={tailwind.style('mt-2')}>
            <Button
              text={saving ? i18n.t('CONTACTS.SAVING') : i18n.t('CONTACTS.SAVE')}
              handlePress={handleSave}
              disabled={saving}
            />
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

export default ContactFormScreen;
