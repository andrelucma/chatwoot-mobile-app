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

const EmptyContactsIcon = ({ isDark }: { isDark: boolean }) => (
  <Svg width="64" height="64" viewBox="0 0 64 64" fill="none">
    <Circle cx="32" cy="22" r="12" stroke={isDark ? '#4b5563' : '#d1d5db'} strokeWidth="2.5" />
    <Path
      d="M10 54C10 42.954 20.059 34 32 34C43.941 34 54 42.954 54 54"
      stroke={isDark ? '#4b5563' : '#d1d5db'}
      strokeWidth="2.5"
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
      navigation.dispatch(
        StackActions.push('ContactDetails', { contactId: contact.id, fromContacts: true }),
      );
    },
    [navigation],
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
            'px-5 py-1 mt-1',
            isDark ? 'bg-grayDark-50' : 'bg-white',
          )}>
          <Animated.Text
            style={tailwind.style(
              'text-xs font-inter-medium-24 tracking-[0.8px] uppercase',
              isDark ? 'text-grayDark-500' : 'text-gray-400',
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
        <EmptyContactsIcon isDark={isDark} />
        <Animated.Text
          style={tailwind.style(
            'text-base font-inter-medium-24 mt-4',
            isDark ? 'text-grayDark-700' : 'text-gray-400',
          )}>
          {query ? i18n.t('CONTACTS.EMPTY_SEARCH') : i18n.t('CONTACTS.EMPTY_STATE')}
        </Animated.Text>
        {!query && (
          <Animated.Text
            style={tailwind.style(
              'text-sm font-inter-normal-20 mt-1',
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
      <Animated.View style={tailwind.style('px-4 pt-1 pb-3')}>
        <Animated.View style={tailwind.style('flex flex-row items-center justify-between')}>
          <Animated.View>
            <Animated.Text
              style={tailwind.style(
                'text-[26px] font-inter-580-24 leading-[32px]',
                isDark ? 'text-grayDark-950' : 'text-gray-950',
              )}>
              {i18n.t('CONTACTS.TITLE')}
            </Animated.Text>
            {totalCount > 0 && (
              <Animated.Text
                style={tailwind.style(
                  'text-[13px] font-inter-normal-20 mt-[2px]',
                  isDark ? 'text-grayDark-500' : 'text-gray-400',
                )}>
                {totalCount} {i18n.t('CONTACTS.CONTACTS_COUNT')}
              </Animated.Text>
            )}
          </Animated.View>

          <Pressable
            onPress={handleNewContact}
            hitSlop={12}
            style={({ pressed }) =>
              tailwind.style(
                'w-9 h-9 rounded-full items-center justify-center',
                isDark
                  ? pressed ? 'bg-grayDark-300' : 'bg-grayDark-200'
                  : pressed ? 'bg-blue-100' : 'bg-blue-50',
              )
            }>
            <Animated.Text
              style={tailwind.style('text-[22px] font-inter-normal-20 leading-[26px] text-blue-700')}>
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
