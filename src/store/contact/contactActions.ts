import { createAsyncThunk } from '@reduxjs/toolkit';
import { ContactService } from './contactService';

import {
  ContactLabelsPayload,
  ContactListResponse,
  SearchContactsPayload,
  CreateContactPayload,
  UpdateContactPayload,
  ContactableInbox,
  CreateConversationPayload,
  CreateConversationAPIResponse,
  WhatsAppTemplate,
} from './contactTypes';
import { Contact } from '@/types';
import { addContact, updateContact as updateContactInStore } from './contactSlice';
import { addConversation } from '@/store/conversation/conversationSlice';
import { transformConversation } from '@/utils/camelCaseKeys';

export const contactActions = {
  searchContacts: createAsyncThunk<ContactListResponse, SearchContactsPayload>(
    'contact/searchContacts',
    async (payload, { rejectWithValue }) => {
      try {
        return await ContactService.searchContacts(payload);
      } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : '');
      }
    },
  ),

  getContact: createAsyncThunk<Contact, number>(
    'contact/getContact',
    async (contactId, { dispatch, rejectWithValue }) => {
      try {
        const contact = await ContactService.getContact(contactId);
        dispatch(addContact(contact));
        return contact;
      } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : '');
      }
    },
  ),

  createContact: createAsyncThunk<Contact, CreateContactPayload>(
    'contact/createContact',
    async (payload, { dispatch, rejectWithValue }) => {
      try {
        const contact = await ContactService.createContact(payload);
        dispatch(addContact(contact));
        return contact;
      } catch (error) {
        const apiErr = error as { response?: { data?: { error?: string; errors?: string[] } } };
        const message =
          apiErr?.response?.data?.error ||
          apiErr?.response?.data?.errors?.[0] ||
          (error instanceof Error ? error.message : '');
        return rejectWithValue(message);
      }
    },
  ),

  updateContact: createAsyncThunk<Contact, UpdateContactPayload>(
    'contact/updateContact',
    async (payload, { dispatch, rejectWithValue }) => {
      try {
        const contact = await ContactService.updateContact(payload);
        dispatch(updateContactInStore(contact));
        return contact;
      } catch (error) {
        const apiErr = error as { response?: { data?: { error?: string; errors?: string[] } } };
        const message =
          apiErr?.response?.data?.error ||
          apiErr?.response?.data?.errors?.[0] ||
          (error instanceof Error ? error.message : '');
        return rejectWithValue(message);
      }
    },
  ),

  deleteContact: createAsyncThunk<number, number>(
    'contact/deleteContact',
    async (contactId, { rejectWithValue }) => {
      try {
        await ContactService.deleteContact(contactId);
        return contactId;
      } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : '');
      }
    },
  ),

  getContactableInboxes: createAsyncThunk<ContactableInbox[], number>(
    'contact/getContactableInboxes',
    async (contactId, { rejectWithValue }) => {
      try {
        return await ContactService.getContactableInboxes(contactId);
      } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : '');
      }
    },
  ),

  createConversation: createAsyncThunk<CreateConversationAPIResponse, CreateConversationPayload>(
    'contact/createConversation',
    async (payload, { dispatch, rejectWithValue }) => {
      try {
        const result = await ContactService.createConversation(payload);
        const conversation = transformConversation(result);
        dispatch(addConversation(conversation));
        return result;
      } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : '');
      }
    },
  ),

  getWhatsAppTemplates: createAsyncThunk<WhatsAppTemplate[], number>(
    'contact/getWhatsAppTemplates',
    async (inboxId, { rejectWithValue }) => {
      try {
        return await ContactService.getWhatsAppTemplates(inboxId);
      } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : '');
      }
    },
  ),

  getContactLabels: createAsyncThunk<
    {
      contactId: number;
      labels: string[];
    },
    ContactLabelsPayload
  >('contact/getContactLabels', async (payload, { rejectWithValue }) => {
    try {
      const response = await ContactService.getContactLabels(payload);
      const { payload: labels } = response;
      return { contactId: payload.contactId, labels };
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      return rejectWithValue(message);
    }
  }),
};
