import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, SectionList, useColorScheme } from 'react-native';
import Animated from 'react-native-reanimated';
import { StackActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle } from 'react-native-svg';

import { SearchBar } from '@/components-next/common/search/SearchBar';
import { Spinner } from '@/components-next/spinner';
import { tailwind } from '@/theme';
import { Contact } from '@/types';
import { useAppDispatch } from '@/hooks';
import { contactActions } from '@/store/contact/contactActions';
import { addContact } from '@/store/contact/contactSlice';
import { ContactItem } from './components/ContactItem';
import i18n from '@/i18n';

const FETCH_DEBOUNCE_MS = 400;

type Section = { title: string; data: Contact[] };

const groupByLetter = (contacts: Contact[]): Section[] => {
  const map = new Map<string, Contact[]>();
  contacts.forEach(c => {
    const letter = (c.name || '#').charAt(0).toUpperCase();
    const key = /[A-Z]/.test(letter) ? letter : '#';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(c);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => (a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b)))
    .map(([title, data]) => ({ title, data }));
};

const EmptyContactsIcon = () => (
  <Svg width="80" height="80" viewBox="0 0 64 64" fill="none">
    <Circle cx="32" cy="22" r="12" fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="2" />
    <Path
      d="M10 54C10 42.954 20.059 34 32 34C43.941 34 54 42.954 54 54"
      stroke="#1D4ED8"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const ContactsScreen = () => {
  const isDark = useColorScheme() === 'dark';
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingRef = useRef(false);
  const queryRef = useRef('');

  useEffect(() => { queryRef.current = query; }, [query]);

  const sections = useMemo<Section[]>(() => {
    if (query) return [{ title: '', data: contacts }];
    return groupByLetter(contacts);
  }, [contacts, query]);

  const fetchContacts = useCallback(
    async (q: string, nextPage: number, reset = false) => {
      if (loadingRef.current && !reset) return;
      loadingRef.current = true;
      setLoading(true);
      try {
        const result = await dispatch(
          contactActions.searchContacts({ q: q || ' ', page: nextPage }),
        ).unwrap();
        setContacts(prev => (reset ? result.contacts : [...prev, ...result.contacts]));
        setTotalCount(result.meta.count);
        setPage(nextPage);
      } catch {
        // silently fail
      } finally {
        loadingRef.current = false;
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dispatch],
  );

  useFocusEffect(
    useCallback(() => {
      fetchContacts(queryRef.current, 1, true);
    }, [fetchContacts]),
  );

  const handleQueryChange = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchContacts(text, 1, true);
      }, FETCH_DEBOUNCE_MS);
    },
    [fetchContacts],
  );

  const handleClear = useCallback(() => {
    setQuery('');
    fetchContacts('', 1, true);
  }, [fetchContacts]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchContacts(query, 1, true);
  }, [fetchContacts, query]);

  const handleLoadMore = useCallback(() => {
    if (contacts.length < totalCount && !loading) {
      fetchContacts(query, page + 1);
    }
  }, [contacts.length, fetchContacts, loading, page, query, totalCount]);

  const handleContactPress = useCallback(
    (contact: Contact) => {
      dispatch(addContact(contact));
      navigation.dispatch(
        StackActions.push('ContactDetails', { contactId: contact.id, fromContacts: true }),
      );
    },
    [dispatch, navigation],
  );

  const handleNewContact = useCallback(() => {
    navigation.dispatch(StackActions.push('ContactFormScreen', {}));
  }, [navigation]);

  const renderItem = useCallback(
    ({ item }: { item: Contact }) => (
      <ContactItem contact={item} onPress={handleContactPress} />
    ),
    [handleContactPress],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: Section }) => {
      if (!section.title) return null;
      return (
        <Animated.View
          style={tailwind.style(
            'flex flex-row items-center pl-4 pr-4 py-[7px]',
            isDark ? 'bg-grayDark-50' : 'bg-white',
          )}>
          <Animated.View style={tailwind.style('w-[3px] h-[14px] rounded-full bg-blue-700 mr-[10px]')} />
          <Animated.Text
            style={tailwind.style(
              'text-xs font-inter-580-24 tracking-[1px] uppercase text-blue-700',
            )}>
            {section.title}
          </Animated.Text>
        </Animated.View>
      );
    },
    [isDark],
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <Animated.View style={tailwind.style('flex-1 items-center justify-center py-16')}>
        <EmptyContactsIcon />
        <Animated.Text
          style={tailwind.style(
            'text-base font-inter-580-24 mt-5',
            isDark ? 'text-grayDark-700' : 'text-gray-700',
          )}>
          {query ? i18n.t('CONTACTS.EMPTY_SEARCH') : i18n.t('CONTACTS.EMPTY_STATE')}
        </Animated.Text>
        {!query && (
          <Animated.Text
            style={tailwind.style(
              'text-sm font-inter-normal-20 mt-1 text-center px-8',
              isDark ? 'text-grayDark-500' : 'text-gray-400',
            )}>
            {i18n.t('CONTACTS.EMPTY_STATE_HINT')}
          </Animated.Text>
        )}
      </Animated.View>
    );
  };

  const renderFooter = () => {
    if (!loading || contacts.length === 0) return null;
    return (
      <Animated.View style={tailwind.style('py-4 items-center')}>
        <Spinner size={20} />
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
        <Animated.View style={tailwind.style('flex flex-row items-start justify-between')}>
          <Animated.View>
            <Animated.Text
              style={tailwind.style(
                'text-[28px] font-inter-580-24 leading-[34px]',
                isDark ? 'text-grayDark-950' : 'text-gray-950',
              )}>
              {i18n.t('CONTACTS.TITLE')}
            </Animated.Text>
            {totalCount > 0 && (
              <Animated.View style={tailwind.style('flex flex-row items-center mt-[4px] gap-[6px]')}>
                <Animated.View style={tailwind.style('w-[6px] h-[6px] rounded-full bg-blue-700')} />
                <Animated.Text style={tailwind.style('text-[13px] font-inter-normal-20 text-blue-700')}>
                  {totalCount} {i18n.t('CONTACTS.CONTACTS_COUNT')}
                </Animated.Text>
              </Animated.View>
            )}
          </Animated.View>

          <Pressable
            onPress={handleNewContact}
            hitSlop={8}
            style={({ pressed }) =>
              tailwind.style(
                'w-10 h-10 rounded-xl items-center justify-center bg-blue-800',
                pressed ? 'opacity-70' : '',
              )
            }>
            <Animated.Text
              style={tailwind.style('text-[26px] font-inter-normal-20 leading-[28px] text-white mt-[-2px]')}>
              +
            </Animated.Text>
          </Pressable>
        </Animated.View>
      </Animated.View>

      {/* Search */}
      <Animated.View style={tailwind.style('pb-2')}>
        <SearchBar
          value={query}
          onChangeText={handleQueryChange}
          onClear={handleClear}
          placeholder={i18n.t('CONTACTS.SEARCH_PLACEHOLDER')}
          isLoading={loading && contacts.length === 0}
        />
      </Animated.View>

      {/* List */}
      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={item => String(item.id)}
        stickySectionHeadersEnabled
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={tailwind.style('pb-4')}
      />
    </Animated.View>
  );
};

export default ContactsScreen;
